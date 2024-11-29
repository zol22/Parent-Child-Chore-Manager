import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useDispatch } from "react-redux"; // Import useDispatch for Redux


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userDoc = await loginUser(email, password, dispatch);

      // After successful login, dispatch user data to Redux
     // dispatch(setUser(userDoc));

      // Redirect based on role
      if (userDoc.role === "Parent") {
        navigate("/parent-dashboard");
      } else {
        navigate("/child-dashboard");
      }
    } catch (err) {
      setError(err.message);
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
