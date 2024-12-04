import './App.css'
import { Routes, Route, Navigate} from "react-router-dom";
import { useEffect} from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home"
import ParentDashboard from "./components/Dashboard/ParentDashboard";
import ChildDashboard from "./components/Dashboard/ChildDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSelector } from "react-redux"; // Import useSelector to check user state

function App() {

  const user = useSelector((state) => state.user.user); // Get the user from the Redux store

  useEffect(() => {
    // Clear persisted state on app load (for debugging)
    localStorage.removeItem('persist:root');
  }, []);


  return (
      <Routes>
        <Route path="/" element={<Home />} />

        {/* If user is logged in, redirect to their dashboard */}
        {user && user.role === "Parent" && <Route path="/login" element={<Navigate to="/parent-dashboard" />} />}
        {user && user.role === "Child" && <Route path="/login" element={<Navigate to="/child-dashboard" />} />}
        {user && user.role === "Parent" && <Route path="/signup" element={<Navigate to="/parent-dashboard" />} />}
        {user && user.role === "Child" && <Route path="/signup" element={<Navigate to="/child-dashboard" />} />}

        {/* Login and Signup pages for logged-out users */}
        {!user && <Route path="/login" element={<Login />} />}
        {!user && <Route path="/signup" element={<Signup />} />}

        {/* Protected Routes for Parent and Child dashboards */}
        <Route
          path="/parent-dashboard"
          element={
            <ProtectedRoute role="Parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/child-dashboard"
          element={
            <ProtectedRoute role="Child">
              <ChildDashboard />
            </ProtectedRoute>
            }
          />
        
        {/* Catch-all route to redirect users to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  )
}

export default App
