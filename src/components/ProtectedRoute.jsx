import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ role, children }) => {
  const user = useSelector((state) => state.user);

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user does not have the required role, redirect to home or another page
  if (user.role !== role) {
    return <Navigate to="/" />;
  }

  // Allow access to the protected route
  return children;
};

export default ProtectedRoute;
