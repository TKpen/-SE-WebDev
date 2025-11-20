import React, {useState} from "react";
import { Link } from "react-router-dom";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Modules from "../components/Modules";
import useDarkMode from "../hooks/useDarkMode";
import logoLight from "../images/WebAppLogoLight.png"
import logoDark from "../images/WebAppLogoDark.png"

export default function Dashboard() {
    const [isDark, setIsDark] = useDarkMode()
    const [settingsOpen, setSettingsOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-gray-900 text-black dark:text-white">
            {/* Header */}
            <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <Link
                    to="/"
                    className="block h-10 w-10 text-left text-sm hover:bg-gray-200 dark:hover:bg-gray-900 hover:rounded"
                >
                    <img 
                        className="hidden dark:block"
                        src={logoDark} 
                        alt="Home"
                    />
                    <img 
                        className="block dark:hidden"
                        src={logoLight} 
                        alt="Home"
                    />
                </Link>
                <h1 className="text-lg font-semibold text-black dark:text-white">Student Organizer Dashboard</h1>
                <div className="relative">
                    <button 
                        onClick={() => setSettingsOpen(prev => !prev)}
                        className="text-sm px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
                    >
                        Settings
                    </button>

                    {settingsOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50">
                            <button
                                onClick={() => setIsDark(prev => !prev)}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                {isDark ? "Light Mode" : "Dark Mode"}
                            </button>
                            <Link
                                to="/preferences"
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                Preferences
                            </Link>
                            <Link
                                to="/profile"
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                Profile
                            </Link>
                            {/* We can add more settings options here */}
                        </div>
                    )}
                </div>
            </header>

            {/* Modules Grid */}
            <main className="p-6">
                <Modules />
            </main>
        </div>
    )
}