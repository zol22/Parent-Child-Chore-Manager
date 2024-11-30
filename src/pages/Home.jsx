import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";


const Home = () => {

  const user = useSelector((state) => state.user);

  // Redirect logged-in users to their respective dashboard
  if (user) {
    if (user.role === "Parent") {
      return <Navigate to="/parent-dashboard" />;
    }
    if (user.role === "Child") {
      return <Navigate to="/child-dashboard" />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center text-white">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-extrabold drop-shadow-md">
          Welcome to the <span className="text-yellow-300">Chore Manager</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto">
          A fun and simple way to organize and track household chores! Empower parents and engage kids with clear task management.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-8 mt-10">
        <Link
          to="/login"
          className="px-8 py-4 bg-yellow-300 text-purple-900 font-bold rounded-lg shadow-lg hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-8 py-4 bg-green-300 text-purple-900 font-bold rounded-lg shadow-lg hover:bg-green-400 transform hover:scale-105 transition-all duration-300"
        >
          Sign Up
        </Link>
      </div>

      {/* Illustration */}
      <div className="mt-16">
        <img
          src="https://illustrations.popsy.co/white/cleaning.svg"
          alt="Household chores illustration"
          className="w-full max-w-lg mx-auto drop-shadow-lg"
        />
      </div>

      {/* Footer */}
      <footer className="mt-16 text-sm text-purple-200">
        Made with ❤️ by your Chore Manager team.
      </footer>
    </div>
  );
};

export default Home;
