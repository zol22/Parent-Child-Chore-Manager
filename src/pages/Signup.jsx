import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser, loginUser } from "../services/authService";
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
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Validate Family ID
    if ((role === "Parent" || role === "Child") && (!familyId || familyId.trim() === "")) {
      setError("Family ID is required.");
      return;
    }

    try {
      const userDoc = await signupUser(email, password, role, familyId, displayName);

      // Immediately log the user in after signup to authenticate the session
      const loggedInUser = await loginUser(email, password, dispatch);

      // Navigate to the appropriate dashboard based on the role
      if (role === "Parent") {
        navigate("/parent-dashboard");
      } else {
        navigate("/child-dashboard");
      }
    } catch (err) {
      console.error("Signup error: ", err);  // Log error for debugging
       if (err.message.includes("email-already-in-use")) {
        setError("Email is already in use. Please try with a different email.");
      } else if (err.message.includes("weak-password")) {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.message.includes("auth/wrong-password")) {
        setError("The provided password is incorrect.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
            <input
            type="text"
            placeholder="Full Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full p-2 border rounded-lg"

          />
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
          {role === "Parent" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Family ID (Create and share this with your child):
              </label>
              <input
                type="text"
                value={familyId}
                onChange={(e) => setFamilyId(e.target.value)}
                placeholder="Enter Family ID"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
          )}

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

        {/* Link to Login Page if the user already has an account */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
