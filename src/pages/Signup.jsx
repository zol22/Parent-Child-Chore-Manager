import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../services/authService";
import { useDispatch } from "react-redux"; // Import useDispatch for Redux


/* 
  Signup: The user creates an account.
  The user’s data is saved to Firestore.
  The user is redirected to the login page.
*/

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Parent");
  const [familyId, setFamilyId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userDoc = await signupUser(email, password, role, role === "Child" ? familyId : null);

      // Dispatch user data to Redux
      dispatch(setUser(userDoc));

      // Navigate to the appropriate dashboard based on the role
      if (role === "Parent") {
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
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
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
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded-lg">
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
          </select>
          {role === "Child" && (
            <input
              type="text"
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
              placeholder="Family ID"
              required
              className="w-full p-2 border rounded-lg"
            />
          )}
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
