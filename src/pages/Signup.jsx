import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Parent");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), { // Save user details in Firestore
        email,
        role,
        familyId: role === "Parent" ? userCredential.user.uid : "", // assign familyId for parents
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSignup} className="bg-white p-8 shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 mb-4 border"
        >
          <option value="Parent">Parent</option>
          <option value="Child">Child</option>
        </select>
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
