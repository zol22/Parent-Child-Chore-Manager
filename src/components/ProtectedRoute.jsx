import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ role, children }) => {

  const user = useSelector((state) => state.user);

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

   // Redirect to appropriate dashboard if user has the wrong role
  if (user.role !== role) {
    if (user.role === "Parent") {
      return <Navigate to="/parent-dashboard" />;
    }
    if (user.role === "Child") {
      return <Navigate to="/child-dashboard" />;
    }
  }

  // Allow access to the protected route
  return children;
};

export default ProtectedRoute;
