// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Modules from "../components/Modules";
import useDarkMode from "../hooks/useDarkMode";
import logoLight from "../images/WebAppLogoLight.png";
import logoDark from "../images/WebAppLogoDark.png";
import SettingsMenu from "../components/SettingsMenu";
import Gestures from "../components/TitleButton";

export default function Dashboard() {
  const [isDark, setIsDark] = useDarkMode();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error(error);
      }

      setUser(user);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // back to Login page
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 text-black dark:text-white flex items-center justify-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 text-black dark:text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-900 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3 ml-18 mt-4">
          <Link
            to="/"
            className="h-10 w-10 text-sm hover:bg-gray-200 dark:hover:bg-gray-900 hover:rounded"
          >
            <Gestures />
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Student Organizer Dashboard
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user
                ? <>Signed in as <strong>{user.email}</strong></>
                : "Guest mode – data may not be saved."}
            </p>
          </div>
        </div>

        {/* Settings menu now receives user + logout */}
        <SettingsMenu user={user} onLogout={handleLogout} />
      </header>

      {/* Modules Grid */}
      <main className="p-6">
        <Modules />
      </main>
    </div>
  );
}
