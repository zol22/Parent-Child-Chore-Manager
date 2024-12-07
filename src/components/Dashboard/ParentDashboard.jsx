import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTasks, setChildren, addTask, assignTask, removePointsFromChild, updateTaskStatus, moveTask, completeTask } from "../../redux/tasksSlice";
import LogoutButton from "../LogoutButton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrophy, FaMedal, FaStar } from "react-icons/fa";


const ParentDashboard = () => {
  const user = useSelector((state) => state.user.user);
  const familyId = useSelector((state) => state.user.familyId); // Updated familyId selector

  const tasks = useSelector((state) => state.tasks.tasks);
  const children = useSelector((state) => state.tasks.children);

  const dispatch = useDispatch();
  const [newTask, setNewTask] = useState("");
  const [newTaskPoints, setNewTaskPoints] = useState(0);


  useEffect(() => {
    // Mock fetching tasks and children based on familyId

    const initialTasks = [
      { id: "1", title: "Clean Kitchen", status: "Unassigned", assignedTo: "", points: 10 },
      { id: "2", title: "Take out Trash", status: "In Progress", assignedTo: "Child 1", points: 7 },
      { id: "3", title: "Wash Dishes", status: "In Progress", assignedTo: "Child 2", points: 10 },
      { id: "4", title: "Walk the Dog", status: "Unassigned", assignedTo: "", points: 8 },
      { id: "5", title: "Cook Dinner", status: "In Progress", assignedTo: "Child 1", points: 8 },
      { id: "6", title: "Cut Grass", status: "In Progress", assignedTo: "Child 2", points: 9 },
      { id: "7", title: "Do Laundry", status: "Unassigned", assignedTo: "", points: 10 },

    ];

    const initialChildren = [
      { id: "c1", name: "Child 1" , points: 0},
      { id: "c2", name: "Child 2", points: 0 },
    ];


    dispatch(setTasks(initialTasks));
    dispatch(setChildren(initialChildren));
  }, [dispatch, familyId]);

  const handleAddTask = () => {

    if (!newTask || newTaskPoints <= 0) {
      alert("Please provide a valid task name and positive points.");
      return;
    }

    if (!newTask) return;
    const task = {
      id: Date.now().toString(),
      title: newTask,
      status: "Unassigned",
      assignedTo: "",
      completed: false,
      points: newTaskPoints,
    };
    dispatch(addTask(task));
    setNewTask("");
    setNewTaskPoints(0);

  };

  const handleDragEnd = (result) => {

    const { source, destination } = result;
    console.log(" This is result", result)
 
    if (!destination) return; // Dropped outside any column

    // Skip if dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Find the task being dragged, draggableid: Uniquely identifies the specific item being dragged
    const draggedTask = tasks.find((task) => task.id === result.draggableId);

    if (!draggedTask) {
      console.error("Task not found!");
      return;
    }

    // Handle task moving back from "Completed"
    if (destination.droppableId !== "Completed" && draggedTask.status === "Completed") {
      // Deduct points if the task is moved out of "Completed" (back to Unassigned or In Progress)
      dispatch(removePointsFromChild({ taskId: result.draggableId, assignedTo: draggedTask.assignedTo, destinationStatus: destination.droppableId }));
      return;
    }

    // If the task is dragged into the "Completed" column and it's not already completed
    if (destination.droppableId === "Completed" && draggedTask.status !== "Completed") {
      dispatch(completeTask(result.draggableId)); // Update task status to completed and award points
    }
    else {
      // Update task's status for other columns
      dispatch(
        moveTask({
        taskId: draggedTask.id,
        status: destination.droppableId,
        })
      );
    }   
  };

  const handleAssignTask = (taskId, childName) => {
   // console.log("Assigning task", taskId, "to", childName);

      dispatch(assignTask({ taskId, assignedTo: childName }));
     // console.log(tasks)

  };

  const handleCompleteTask = (taskId) => {
    dispatch(completeTask(taskId));
    console.log("after moving the card to complete...", tasks)

  };

  const filterTasksByStatus = (status) => tasks.filter((task) => task.status === status);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Welcome, {user.email} ({user.role})</h1>
      <LogoutButton/>

      {/* Chore Creation */}
      <div className="mt-6 flex space-x-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Chore"
          className="w-1/3 px-4 py-2 border rounded-lg"
        />
        <input
          type="number"
          value={newTaskPoints || ""}
          onChange={(e) => {
            const value = e.target.value;
            // Prevent leading zeroes and ensure non-negative values
            if (value === "" || /^[1-9]\d*$/.test(value)) {
              setNewTaskPoints(value);
            }
          } }
          placeholder="Add task points"
          className="w-1/4 px-4 py-2 border rounded-lg"
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
                            <p className="text-sm text-blue-600">Points: {task.points}</p>
                            <p>Assigned to: {task.assignedTo || "Unassigned"}</p>
                            <div className="flex flex-col items-start">
                              <select
                                value={task.assignedTo}
                                onChange={(e) => handleAssignTask(task.id, e.target.value)}
                                className="mt-2 px-4 py-2 border rounded-lg"
                              >
                                <option value="">Unassigned</option>
                                {children.map((child) => (
                                  <option key={child.id} value={child.name}>
                                    {child.name}
                                  </option>
                                ))}
                              </select>

                              {/* Only show Mark as Complete if task is In Progress or Assigned */}
                              {status !== "Completed" && (task.status === "In Progress")  && (task.assignedTo !== "Unassigned") && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg"
                              >
                                Mark as Complete
                              </button>
                            )}

                            </div>

                            {/* Points / Rewards */}
                            {task.status === "Completed" && (
                              <div className="mt-2 text-green-500">
                                <p>Points Awarded: {task.points}</p>
                                <div className="flex items-center space-x-2">
                                  <FaTrophy className="text-yellow-500" />
                                  <p>Reward: {task.points >= 10 ? "Gold Star" : "Silver Star"}</p>
                                </div>
                              </div>
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

       {/* Children's Rewards */}
       <div className="mt-8">
        <h3 className="text-xl font-bold">Children's Rewards</h3>
        <div className="flex space-x-4">
          {children.map((child) => (
            <div key={child.id} className="bg-white shadow-md rounded-lg p-4">
              <h4 className="font-bold">{child.name}</h4>
              <p className="text-gray-500">Points: {child.points || 0}</p>
              <div className="flex items-center space-x-2 mt-2">
                {child.points >= 10 ? (
                  <FaTrophy className="text-yellow-500" />
                ) : (
                  <FaStar className="text-gray-500" />
                )}
                <span>{child.points >= 10 ? "Gold Star" : "Silver Star"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ParentDashboard;
