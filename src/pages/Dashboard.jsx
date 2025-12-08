import React, {useState} from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Modules from "../components/Modules";
import useDarkMode from "../hooks/useDarkMode";
import logoLight from "../images/WebAppLogoLight.png"
import logoDark from "../images/WebAppLogoDark.png"
import SettingsMenu from "../components/SettingsMenu";
import Gestures from "../components/TitleButton";

export default function Dashboard() {
    const [isDark, setIsDark] = useDarkMode()
    const [settingsOpen, setSettingsOpen] = useState(false)

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
                    <h1 className="text-lg font-semibold tracking-tight">Student Organizer Dashboard</h1>
                </div>
                <SettingsMenu />
            </header>

            {/* Modules Grid */}
            <main className="p-6">
                <Modules />
            </main>
        </div>
    )
}