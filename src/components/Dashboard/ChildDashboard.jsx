import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTasks, completeTask, moveTask, setChildren } from "../../redux/tasksSlice";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import LogoutButton from "../LogoutButton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ChildDashboard = () => {
  const user = useSelector((state) => state.user.user); // Get logged-in user details
  const tasks = useSelector((state) => state.tasks.tasks); // Redux tasks state
  const dispatch = useDispatch();
  const children = useSelector((state) => state.tasks.children);

  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Fetch tasks assigned to the child
    const tasksQuery = query(
      collection(db, "tasks"),
      where("assignedTo", "==", user.displayName)
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const assignedTasks = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      dispatch(setTasks(assignedTasks));
    });

    // Fetch child's points
    const userDocRef = doc(db, "users", user.userId);
    const unsubscribePoints = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setPoints(doc.data().points || 0);
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribePoints();
    };
  }, [dispatch, user.displayName, user.userId]);


  /* Its adding a children array inside the child document*/
  const handleDragEnd = async (result) => {
    const { source, destination } = result;
  
    if (!destination || source.droppableId === destination.droppableId) return;
  
    const draggedTask = tasks.find((task) => task.id === result.draggableId);
    if (!draggedTask) {
      console.error("Dragged task not found");
      return;
    }
  
    const newStatus = destination.droppableId;
    const previousStatus = draggedTask.status;
  
    try {
      // Update task status in Firestore
      const taskRef = doc(db, "tasks", draggedTask.id);
      await updateDoc(taskRef, { status: newStatus });
  
      // Update Redux task status
      dispatch(moveTask({ taskId: draggedTask.id, status: newStatus }));
  
      let updatedPoints = points;
  
      if (newStatus === "Completed" && previousStatus !== "Completed") {
        // Add points when moving to "Completed"
        updatedPoints += draggedTask.points;
  
        // Update Firestore: Child document points
        const childDocRef = doc(db, "users", user.userId);
        await updateDoc(childDocRef, { points: updatedPoints });
  
        // Update Firestore: Parent's children array
        const parentQuery = query(
          collection(db, "users"),
          where("role", "==", "Parent"),
          where("familyId", "==", user.familyId)
        );
  
        const parentSnapshot = await getDocs(parentQuery);
        if (!parentSnapshot.empty) {
          const parentDoc = parentSnapshot.docs[0];
          const parentDocRef = parentDoc.ref;
  
          const updatedChildren = parentDoc.data().children.map((child) =>
            child.name === user.displayName
              ? { ...child, points: updatedPoints }
              : child
          );
  
          await updateDoc(parentDocRef, { children: updatedChildren });
        }
      } else if (previousStatus === "Completed" && newStatus !== "Completed") {
        // Deduct points when moving back
        updatedPoints = Math.max(updatedPoints - draggedTask.points, 0);
  
        // Update Firestore: Child document points
        const childDocRef = doc(db, "users", user.userId);
        await updateDoc(childDocRef, { points: updatedPoints });
  
        // Update Firestore: Parent's children array
        const parentQuery = query(
          collection(db, "users"),
          where("role", "==", "Parent"),
          where("familyId", "==", user.familyId)
        );
  
        const parentSnapshot = await getDocs(parentQuery);
        if (!parentSnapshot.empty) {
          const parentDoc = parentSnapshot.docs[0];
          const parentDocRef = parentDoc.ref;
  
          const updatedChildren = parentDoc.data().children.map((child) =>
            child.name === user.displayName
              ? { ...child, points: updatedPoints }
              : child
          );
  
          await updateDoc(parentDocRef, { children: updatedChildren });
        }
      }
  
      // Update Redux state for immediate UI feedback
      setPoints(updatedPoints);
    } catch (err) {
      console.error("Error updating Firestore or points:", err);
    }
  };
  
  

  const filterTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
      <LogoutButton />

      {/* Display Points */}
      <div className="mt-6">
        <h2 className="text-xl font-bold">Your Points: {points}</h2>
      </div>

      {/* Drag and Drop Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex mt-8 space-x-4">
          {["Assigned", "In Progress", "Completed"].map((status) => (
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
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-4 bg-gray-200 border rounded-lg shadow-md"
                          >
                            <h3 className="font-bold">{task.title}</h3>
                            <p>Points: {task.points}</p>
                            <p>Status: {task.status}</p>
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

export default ChildDashboard;
