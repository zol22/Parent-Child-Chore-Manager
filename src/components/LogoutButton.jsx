import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice'; // Import the logout action
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action to clear user data
    navigate('/'); // Redirect user to the homepage
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
