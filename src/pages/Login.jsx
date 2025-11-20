import React from "react";
import { Link } from "react-router-dom";

export default function Login() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
            <h1 className="text-2xl font-bold mb-4">Log In</h1>
            <p className="mb-6">Sign in with your school account:</p>
            <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
                onClick={() => alert("Microsoft SSO integration coming soon!")}
            >
                Sign in with Microsoft
            </button>
            <Link
                to="/dashboard"
                className="px-6 py-3 m-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
                Continue Without Signing In
            </Link>
        </div>
    )
}