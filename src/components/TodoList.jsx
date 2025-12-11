// src/components/TodoList.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';
import { bounceTransition } from '../hooks/motionTransitions';
import { supabase } from "../lib/supabaseClient";

const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };

const TodoList = ({ onListOpenChange, onTaskCountChange }) => {
  const [tasks, setTasks] = useState([]);        // start empty, cloud will load
  const [hasLoaded, setHasLoaded] = useState(false); // so we don’t overwrite cloud data
  const [isListOpen, setIsListOpen] = useState(true);

  // Load tasks from Supabase when component mounts
  useEffect(() => {
    async function loadTasks() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;

      if (!user) {
        // not logged in, nothing to load
        setHasLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_data")
        .select("tasks")
        .eq("user_id", user.id)
        .single();

      if (!error && data && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }

      setHasLoaded(true);
    }

    loadTasks();
  }, []);

  // Save tasks to Supabase whenever they change (after first load)
  useEffect(() => {
    if (!hasLoaded) return;

    async function saveTasks() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;
      if (!user) return;

      await supabase.from("user_data").upsert({
        user_id: user.id,
        tasks: tasks,
        updated_at: new Date().toISOString(),
      });
    }

    saveTasks();
  }, [tasks, hasLoaded]);

  // Notify parent when task count changes
  useEffect(() => {
    if (typeof onTaskCountChange === "function") {
      onTaskCountChange(tasks.length);
    }
  }, [tasks.length, onTaskCountChange]);

  const addTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // incomplete first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // then priority
    const priorityDiff =
      PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // then due date (earlier first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });

  const toggleListOpen = () => {
    setIsListOpen((prev) => {
      const next = !prev;
      if (typeof onListOpenChange === "function") {
        onListOpenChange(next);
      }
      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col text-white">
      {/* Always visible input area */}
      <TodoForm addTask={addTask} />

      {/* Toggle bar for the list */}
      <button
        type="button"
        onClick={toggleListOpen}
        className="mt-1 mb-1 flex items-center justify-between px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition"
      >
        <span className="font-semibold">
          Tasks {sortedTasks.length > 0 && `(${sortedTasks.length})`}
        </span>
        <span className="text-gray-300">
          {isListOpen ? "Hide" : "Show"}
        </span>
      </button>

      {/* Animated list area */}
      <AnimatePresence initial={false}>
        {isListOpen && (
          <motion.div
            key="task-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={bounceTransition}
            className="mt-1 overflow-hidden flex-1"
          >
            <motion.div
              layout
              className="max-h-60 overflow-y-auto pr-1 scrollbar-hide"
            >
              <AnimatePresence initial={false}>
                {sortedTasks.length > 0 ? (
                  sortedTasks.map((task) => (
                    <TodoItem
                      key={task.id}
                      task={task}
                      toggleComplete={toggleComplete}
                      deleteTask={deleteTask}
                    />
                  ))
                ) : (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={bounceTransition}
                    className="text-center text-gray-500 py-4 text-sm"
                  >
                    {hasLoaded ? "No tasks added yet!" : "Loading tasks..."}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodoList;
