import './App.css'
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
//import Login from "./pages/Login";
//import ParentDashboard from "./components/Dashboard/ParentDashboard";
//import ChildDashboard from "./components/Dashboard/ChildDashboard";



function App() {

  return (
      <Routes>
        {/*<Route path="/" element={<Login />} />*/}
        <Route path="/signup" element={<Signup />} />
        {/*<Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/child-dashboard" element={<ChildDashboard />} />*/}
      </Routes>
  )
}

export default App
