import React from "react";
import { Link } from "react-router-dom";
import homeLogo from "../images/WebAppHomeLogo.png"
import Gestures from "../components/TitleButton";

export default function Home() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            {/* Background layers */}
            <div className="pointer-events-none absolute inset-0">
                {/* Radial glow behind hero */}
                <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
                {/* Soft diagonal gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.4),_transparent_60%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(15,23,42,0.9),_rgba(15,23,42,1))]" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
                {/* Top bar to match dashboard */}
                <header className="mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="">
                            <Gestures />
                        </div>
                        <span className="text-lg font-semibold tracking-tight">
                            Student Organizer
                        </span>
                    </div>

                    <Link
                        to="/login"
                        className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 backdrop-blur-sm hover:border-cyan-400/80 hover:text-cyan-100 transition"
                    >
                        Sign in
                    </Link>
                </header>

                {/* Hero section */}
                <main className="flex flex-1 flex-col items-center gap-12 md:flex-row md:items-center">
                    {/* Left: text */}
                    <section className="flex-1 space-y-6">
                        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                            Keep <span className="text-cyan-400">every class</span>, note, and
                            deadline in one clean dashboard.
                        </h1>
                        <p className="max-w-xl text-sm md:text-base text-slate-300">
                            The Student Organizer brings your grade calculator, to-dos, and
                            notes together so you can stop jumping between tabs and focus on
                            actually passing your classes.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/dashboard"
                                className="hero-box"
                            >
                                Open Dashboard
                            </Link>
                            {/* <button className="rounded-xl border border-slate-600 bg-slate-900/70 px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-cyan-400/80 hover:text-cyan-100 transition">
                                Watch Overview
                            </button> */}
                        </div>

                        <p className="text-xs text-slate-400">
                            No extra accounts—just sign in with your school login.
                        </p>
                    </section>

                    {/* Right: dashboard preview card */}
                    <section className="flex-1">
                        <div className="mx-auto max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl shadow-black/60 backdrop-blur">
                            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                                <span>Student Organizer Dashboard</span>
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            </div>

                            {/* Fake modules referencing the real dashboard */}
                            <div className="grid gap-3">
                                <div className="rounded-xl bg-slate-800/90 p-3">
                                    <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                                        <span>Grade Calculator</span>
                                        <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-cyan-300">
                                            92.4% A
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-700">
                                    <div className="h-2 w-11/12 rounded-full bg-cyan-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-slate-800/90 p-3 text-xs text-slate-300">
                                    <div className="mb-1 flex items-center justify-between">
                                        <span>To-Do</span>
                                        <span className="text-[10px] text-cyan-300">3 due</span>
                                    </div>
                                    <ul className="space-y-1 text-[11px]">
                                        <li>• Homework</li>
                                        <li>• Lab report</li>
                                        <li className="text-slate-500">• Group meeting</li>
                                    </ul>
                                </div>

                                <div className="rounded-xl bg-slate-800/90 p-3 text-xs text-slate-300">
                                    <div className="mb-1 flex items-center justify-between">
                                        <span>Notes</span>
                                        <span className="text-[10px] text-cyan-300">CS 251</span>
                                    </div>
                                    <p className="line-clamp-3 text-[11px] text-slate-400">
                                        • Midterm topics
                                        <br />
                                        • Big-O cheatsheet
                                        <br />
                                        • Exam tips
                                    </p>
                                </div>
                            </div>
                        </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
