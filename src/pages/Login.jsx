import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useDispatch } from "react-redux"; // Import useDispatch for Redux

/* 
  Login:
  The user logs in with their credentials.
  Firebase checks the credentials and gives the user.uid.
  The app then fetches the user’s full data from Firestore using the user.uid.
  The user’s data is dispatched to Redux using setUser.
*/

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Reference to the Redux store's dispatch function within your component.

  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent form from reloading the page
    setError("");  // Clear any previous errors

    try {
      const userDoc = await loginUser(email, password, dispatch); // loginUser function can use dispatch to send actions to the Redux store if the login is successful.

      // Redirect based on role
      if (userDoc.role === "Parent") {
        navigate("/parent-dashboard");
      } else {
        navigate("/child-dashboard");
      }
    } catch (err) {
        if (err.code === "auth/user-not-found") {
          setError("No user found with this email.");
        } else if (err.code === "auth/wrong-password") {
          setError("Incorrect password.");
        } 
          else if (err.code === "auth/invalid-credential"){
            setError("Invalid Credentials. Try again")
        }
        else {
          setError(err.message); // Generic error message
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-2 border rounded-lg"
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
