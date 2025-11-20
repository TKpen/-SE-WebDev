import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Preferences from "./pages/Preferences.jsx"
import Profile from "./pages/Profile.jsx";
import "./styles/modules.tailwind.css"
import "./index.css"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/preferences" element={<Preferences />}/>
        <Route path="/profile" element={<Profile />}/>
      </Routes>
    </Router>
  );
}