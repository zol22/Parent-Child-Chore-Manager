import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTasks, setChildren, addChild, removeChild, addTask, assignTask, removePointsFromChild, updateTaskStatus, moveTask, completeTask } from "../../redux/tasksSlice";
import { doc, getDoc,getDocs, setDoc,collection, onSnapshot, updateDoc, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../services/firebase";
import LogoutButton from "../LogoutButton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrophy, FaMedal, FaStar } from "react-icons/fa";


const ParentDashboard = () => {
  const user = useSelector((state) => state.user.user);
  const familyId = useSelector((state) => state.user.familyId); // Updated familyId selector

  const tasks = useSelector((state) => state.tasks.tasks);
  //console.log("tasks from parentDashboard", JSON.stringify(tasks))
  const children = useSelector((state) => state.tasks.children);

  const dispatch = useDispatch();
  const [newTask, setNewTask] = useState("");
  const [newTaskPoints, setNewTaskPoints] = useState(0);
  const [newChildName, setNewChildName] = useState("");


  /* Firestore as the source of truth, with Redux for session state caching */

  useEffect(() => {

    // Fetch tasks for the parent
    const tasksQuery = query(collection(db, "tasks"), where("familyId", "==", familyId));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
    const tasksData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    dispatch(setTasks(tasksData));
    });

    // Fetch children for the parent
    const parentDocRef = doc(db, "users", user.userId);
    // Use Firestore listeners to update Redux whenever the database changes:
    const unsubscribeChildren = onSnapshot(parentDocRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      dispatch(setChildren(data.children || []));
    }
  });

  return () => {
    unsubscribeTasks();
    unsubscribeChildren();
  }
  }, [dispatch, familyId, user.userId]);

  const handleAddChild = async() => {
    if (!newChildName.trim()) {
      alert("Child name cannot be empty");
      return;
    }
    const newChild = {
      id: `c${Date.now()}`,
      name: newChildName,
      points: 0,
    };

      // Optimistic UI update
    dispatch(addChild(newChild));

    try {
      // Add child to Firestore
      const parentDocRef = doc(db, "users", user.userId); // Use `user.userId` to target parent's Firestore doc
      await updateDoc(parentDocRef, {
        children: arrayUnion(newChild),

      });
    } catch (err) {
      console.error("Error adding child to Firestore:", err);
      alert("Failed to add child. Please try again.");
      // Rollback on error
      dispatch(removeChild(newChild.id));
    } finally {
      setNewChildName("")
    }

  };

  const handleRemoveChild = async (childId) => {
    const childToRemove = children.find((child) => child.id === childId);

    if (!childToRemove) {
      alert("Child not found");
      return;
    }

    try {
      const parentDocRef = doc(db, "users", user.userId);
      await updateDoc(parentDocRef, {
        children: arrayRemove(childToRemove),
      });

      // Update Redux state
      dispatch(removeChild(childId));
    } catch (err) {
      console.error("Error removing child from Firestore:", err);
      alert("Failed to remove child. Please try again.");
    }
  };

  const handleAddTask = async() => {

    if (!newTask || newTaskPoints <= 0) {
      alert("Please provide a valid task name and positive points.");
      return;
    }

    if (!newTask) return;
    const task = {
      id: Date.now().toString(),
      familyId: familyId,
      title: newTask,
      status: "Unassigned",
      assignedTo: "",
      completed: false,
      points: newTaskPoints,
    };
    try {
      const taskDocRef = doc(collection(db, "tasks"));
      await setDoc(taskDocRef, task); // Firestore auto-generates the ID
      //dispatch(addTask(task));
      setNewTask("");
      setNewTaskPoints(0);
    } catch (err) {
      console.error("Error adding task:", err);
    }


  };


  const handleDragEnd =  async(result) => {

    const { source, destination } = result;
 
    if (!destination || source.droppableId === destination.droppableId) return;

    // Find the task being dragged, draggableid: Uniquely identifies the specific item being dragged
    const draggedTask = tasks.find((task) => task.id === result.draggableId);

    if (!draggedTask) return;

    const newStatus = destination.droppableId;

    try {
      // Handle moving back from "Completed"
      if (draggedTask.status === "Completed" && newStatus !== "Completed") {
        // Moving out of Completed (Deduct Points)
        dispatch(removePointsFromChild({
          taskId: draggedTask.id,
          assignedTo: draggedTask.assignedTo,
          destinationStatus: newStatus,
        }));
  
        const child = children.find((child) => child.name === draggedTask.assignedTo);
        if (child) {
          const updatedPoints = Math.max((child.points || 0) - draggedTask.points, 0);
  
          // Update parent's children array
          const parentDocRef = doc(db, "users", user.userId);
          await updateDoc(parentDocRef, {
            children: children.map((c) =>
              c.name === child.name ? { ...c, points: updatedPoints } : c
            ),
          });
  
          // Update child's document
          const childDocRef = doc(db, "users", child.id);
          await updateDoc(childDocRef, { points: updatedPoints });
        }
      }
  
      if (newStatus === "Completed" && draggedTask.status !== "Completed") {
        // Moving into Completed (Award Points)
        await handleCompleteTask(draggedTask.id);
      }
  
      // Update task status in Firestore
      const taskDocRef = doc(db, "tasks", draggedTask.id);
      await updateDoc(taskDocRef, { status: newStatus });
  
      // Update Redux state
      dispatch(moveTask({ taskId: draggedTask.id, status: newStatus }));
    } catch (error) {
      console.error("Error updating task status or points:", error);
    }

  };

  const handleAssignTask = async (taskId, childName) => {

      dispatch(assignTask({ taskId, assignedTo: childName }));

      try {
        const docRef = doc(db, "tasks", taskId);
    
        await updateDoc(docRef, {
          assignedTo: childName
        });
    
        console.log("Document updated successfully!");
      } catch (error) {
        console.error("Error updating document: ", error);
      }

  };

  const handleCompleteTask = async (taskId) => {
    
    const task = tasks.find((task) => task.id === taskId);
    if (!task || !task.assignedTo) return;

    dispatch(completeTask(taskId));

    try {
      // Update task status in Firestore
      const taskDocRef = doc(db, "tasks", taskId);
      await updateDoc(taskDocRef, { status: "Completed" });
  
      // Update child's points in Firestore
      const child = children.find((child) => child.name === task.assignedTo);
      if (child) {
        const updatedPoints = (child.points || 0) + task.points;
  
        // Update in parent's children array
        const parentDocRef = doc(db, "users", user.userId);
        await updateDoc(parentDocRef, {
          children: children.map((c) =>
            c.id === child.id ? { ...c, points: updatedPoints } : c
          ),
        });
  
        // Update in child's user document. This is not working , pointing different id
        const childDocRef = doc(db, "users", child.id);
        await updateDoc(childDocRef, { points: updatedPoints });
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }

    /*try {
      const tasksQuery = query(collection(db, "tasks"), where("familyId", "==", familyId));
      const querySnapshot = await getDocs(tasksQuery);  // Execute the query to get matching documents

     const updatedTasks = tasks.map((task) =>
        task.id === taskId? { ...task, status: "Completed" } : task
      )

      // Update the task status in Firestore
      querySnapshot.forEach(async (taskDoc) => {
      const taskRef = doc(db, "tasks", taskDoc.id); // Get the reference of the task document
      // Find the updated task in the array and update it in Firestore
      const updatedTask = updatedTasks.find((task) => task.id === taskDoc.id);
      if (updatedTask) {
        await updateDoc(taskRef, {
          status: updatedTask.status // Update the status field
        });
        console.log(`Task ${taskDoc.id} updated to status: ${updatedTask.status}`);
      }
    });
  } catch (err) {
    console.error("Error updating task status in Firestore:", err);
  }*/

  };

  const filterTasksByStatus = (status) => tasks.filter((task) => task.status === status);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Welcome, {user.displayName} ({user.role})</h1>
      <LogoutButton/>

    {/* List of Children with Enhanced UX */}
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Children</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between items-center"
          >
            <h3 className="font-semibold text-lg text-gray-700">{child.name}</h3>
            <p className="text-gray-500">Points: {child.points || 0}</p>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to remove ${child.name}? This action cannot be undone.`
                  )
                ) {
                  handleRemoveChild(child.id);
                }
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
    {/* Child Creation */}
    <div className="mt-6 flex space-x-4">
          <input
            type="text"
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            placeholder="New Child Name"
            className="w-1/3 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleAddChild}
            className="ml-4 px-6 py-2 bg-green-500 text-white rounded-lg"
          >
            Add Child
          </button>
    </div>

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
