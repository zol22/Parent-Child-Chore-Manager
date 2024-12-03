import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTasks, addTask, moveTask, completeTask } from "../../redux/tasksSlice";
import LogoutButton from "../LogoutButton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ParentDashboard = () => {
  const user = useSelector((state) => state.user);
  const tasks = useSelector((state) => state.tasks.tasks);
  const dispatch = useDispatch();
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const initialTasks = [
      { id: "1", title: "Clean Kitchen", status: "Unassigned", assignedTo: "", completed: false, points: 0 },
      { id: "2", title: "Take out Trash", status: "In Progress", assignedTo: "Child 1", completed: false, points: 0 },
      { id: "3", title: "Wash Dishes", status: "Completed", assignedTo: "Child 2", completed: true, points: 0 },
    ];
    dispatch(setTasks(initialTasks));
  }, [dispatch]);

  const handleAddTask = () => {
    if (!newTask) return;
    const task = {
      id: Date.now().toString(),
      title: newTask,
      status: "Unassigned",
      assignedTo: "",
      completed: false,
      points: 0,
    };
    dispatch(addTask(task));
    setNewTask("");
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    console.log("This is result of onDragEnd ", result)
    if (!destination) return; // Dropped outside any column

    // Skip if dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Find the task being dragged
    const draggedTask = tasks.find((task) => task.id === result.draggableId);
    if (!draggedTask) {
      console.error("Task not found!");
      return;
    }

    const isCompletedColumn = destination.droppableId === "Completed";

    // Dispatch moveTask with the new status (destination.droppableId is the column's id)
    if (destination.droppableId === "Completed" && draggedTask.status !== "Completed") {
      // Mark as complete if dropped in the "Completed" column
      dispatch(completeTask(draggedTask.id));
    } else {
      // Update task's status for other columns
      dispatch(
        moveTask({
          taskId: draggedTask.id,
          status: destination.droppableId,
          completed: isCompletedColumn, // Set completed status based on destination

        })
      );
    }
    console.log("after moving the card...", tasks)
  };

  const handleCompleteTask = (taskId) => {
    dispatch(completeTask(taskId));
    console.log("after moving the card to complete...", tasks)

  };

  const filterTasksByStatus = (status) => tasks.filter((task) => task.status === status);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Welcome, {user.email} (Parent)</h1>
      <LogoutButton />

      {/* Chore Creation */}
      <div className="mt-6 flex">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Chore"
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleAddTask}
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          Add Task
        </button>
      </div>

      {/* Drag and Drop Board 
        - DroppableId matches the status values ("Unassigned," "In Progress," "Completed").
      */}   
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex mt-8 space-x-4">
          {["Unassigned", "In Progress", "Completed"].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => ( 
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-4 w-1/3 bg-white shadow-md rounded-lg"
                >
                  <h2 className="text-xl font-bold mb-4">{status}</h2>
                  <div className="space-y-4">
                    {filterTasksByStatus(status).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-4 bg-gray-200 border rounded-lg shadow-md"
                          >
                            <h3 className="font-bold">{task.title}</h3>
                            <p>Status: {task.completed ? "Completed" : "Incomplete"}</p>
                            <p>Assigned to: {task.assignedTo || "Unassigned"}</p>
                            {!task.completed && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg"
                              >
                                Mark as Complete
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ParentDashboard;
