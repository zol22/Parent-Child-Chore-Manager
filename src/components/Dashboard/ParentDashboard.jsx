//import ChoreList from "./ChoreList";
//import AddChoreForm from "./AddChoreForm";
import LogoutButton from "../LogoutButton";
import { useSelector, useDispatch } from "react-redux";
import { setTasks, assignTask, addTask} from "../../redux/tasksSlice";
import { useEffect, useState } from 'react';

{/* 
  Key Features of ParentDashboard:
  Task Assignment: Parent can assign tasks to children using a dropdown, Drag and drop tasks to assign kids.
  Task Completion: Parent can mark tasks as completed and awards point or badges. Traking progress nad managing rewards
  Logout: Parent can log out, clearing their session.
  Responsive and Accessible UI: Task list is visually separated, and actions like assigning or completing tasks are intuitive.
  UI: Kanban-style board (like Trello) with draggable cards for tasks.
Columns: "Unassigned," "In Progress," and "Completed."

Components: Chore creation forms , drag and drop board and progress analytics
  
  */}
const ParentDashboard = () => {

  const user = useSelector((state) => state.user);
  const tasks = useSelector((state) => state.tasks.tasks); // Get tasks from Redux
  const dispatch = useDispatch();
  const [newTask, setNewTask] = useState('');


  useEffect(() => {
    const initialTasks = [
      { id: '1', title: 'Clean Kitchen', status: 'Unassigned', assignedTo: '', completed: false, points: 0 },
      { id: '2', title: 'Take out Trash', status: 'Unassigned', assignedTo: '', completed: false, points: 0 },
      { id: '3', title: 'Wash Dishes', status: 'Unassigned', assignedTo: '', completed: false, points: 0 },
    ];
  
    console.log('Dispatching initial tasks:', initialTasks);
    dispatch(setTasks(initialTasks));
  }, [dispatch]);


  const handleAddTask = () => {
    if (!newTask) return; // Prevent adding empty tasks
    console.log('Tasks before adding:', JSON.stringify(tasks));

    // Ensure tasks is an array before adding a task
    if (!Array.isArray(tasks)) {
      console.error('Tasks state is not an array', tasks);
      return;
    }
    
    // Create the new task object
    const task = { 
      id: Date.now().toString(), 
      title: newTask, 
      status: 'Unassigned', 
      assignedTo: '', 
      completed: false, 
      points: 0 };

    dispatch(addTask(task));
    setNewTask('');

    console.log('Tasks after adding:', JSON.stringify([...tasks, task]));

  };

  return (
      <div className="min-h-screen">
        <h1>Welcome, {user.email} (Parent)</h1>  
        <LogoutButton />
        <div>
          <h2>Task Overview</h2>
        </div>

        {/* Chore Creation */}
        <div className="mt-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New Chore"
            className="px-4 py-2 border rounded-lg"
          />
          <button onClick={handleAddTask} className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg">Add Task</button>
        </div>

        {/* Task List 
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Tasks:</h2>
          <ul className="space-y-2 mt-4">
            {tasks.map((task) => (
              <li key={task.id} className="p-4 bg-white border rounded-lg shadow-md">
                <div>{task.title}</div>
                <div>Status: {task.status}</div>
                <div>Assigned to: {task.assignedTo}</div>
              </li>
            ))}
          </ul>
        </div> */}
      
      </div>

    );
};

export default ParentDashboard;
