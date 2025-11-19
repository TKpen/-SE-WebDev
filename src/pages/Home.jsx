import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text black dark:text-white">
            <h1 className="text-3xl font-bold mb-4">Welcome to the Student Organizer</h1>
            <p className="mb-6 text-center max-w-md">
                Stay organized, take notes, and manage your student life all in one place.
            </p>
            <Link
                to="/login"
                className="px-6 py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
            >
                Log In with Microsoft
            </Link>
        </div>
    )
}