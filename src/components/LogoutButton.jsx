import { useDispatch, useSelector} from 'react-redux';
import { logout } from '../redux/userSlice'; // Import the logout action
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);


  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action to clear user data
    console.log("User state after logout: ", user)
    // Clear persisted state from localStorage
    localStorage.removeItem('persist:root');
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
