import React, {useState} from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Notes from "../components/Notes";
import Modules from "../components/Modules";
import useDarkMode from "../hooks/useDarkMode";

export default function Dashboard() {
    const [isDark, setIsDark] = useDarkMode()
    const [settingsOpen, setSettingsOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-gray-900 text-black dark:text-White">
            {/* Header */}
            <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h1 className="text-lg font-semibold text-black dark:text-white">Student Organizer Dashboard</h1>
                <div className="relatice">
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