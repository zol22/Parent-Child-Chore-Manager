import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ParentDashboard from "./components/Dashboard/ParentDashboard";
import ChildDashboard from "./components/Dashboard/ChildDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

const App = () => {
  const user = useSelector((state) => state.user);

  return (
    <Routes>
      {/* Landing/Home page */}
      <Route path="/" element={user ? <Navigate to={user.role === "Parent" ? "/parent-dashboard" : "/child-dashboard"} /> : <Home />} />
      
      {/* Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
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

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
