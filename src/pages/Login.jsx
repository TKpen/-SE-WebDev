import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // "signin" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        alert(
          "Account created! If email confirmation is enabled, check your inbox."
        );
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">
          {mode === "signup" ? "Create Account" : "Log In"}
        </h1>
        <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
          Use any email (your school email works too).
        </p>

        {/* Toggle Sign In / Sign Up */}
        <div className="flex justify-center mb-4 gap-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              mode === "signin"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              mode === "signup"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-md px-3 py-2 text-black dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-md px-3 py-2 text-black dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold disabled:opacity-60 transition"
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? "Create Account"
              : "Log In"}
          </button>
        </form>

        {/* Continue Without Signing In */}
        <Link
          to="/dashboard"
          className="px-6 py-3 mt-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition text-sm"
        >
          Continue Without Signing In
        </Link>
      </div>
    </div>
  );
}
