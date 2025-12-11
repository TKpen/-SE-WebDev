import React, { useState, useEffect } from 'react';
import {motion, AnimatePresence} from "framer-motion";
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';
import { bounceTransition } from '../hooks/motionTransitions';

const PRIORITY_ORDER = { 'High': 3, 'Medium': 2, 'Low': 1 };
const LOCAL_STORAGE_KEY = 'student-organizer-tasks';

const TodoList = ({ onListOpenChange, onTaskCountChange}) => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [isListOpen, setIsListOpen] = useState(true);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (typeof onTaskCountChange === "function") {
      onTaskCountChange(tasks.length);
    }
  }, [tasks.length, onTaskCountChange]);

  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return 0;
  });

  const toggleListOpen = () => {
    setIsListOpen(prev => {
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
        type='button'
        onClick={toggleListOpen}
        className='mt-1 mb-1 flex items-center justify-between px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition'
      >
        <span className='font-semibold'>
          Tasks {sortedTasks.length > 0 && `(${sortedTasks.length})`}
        </span>
        <span className='text-gray-300'>
          {isListOpen ? "Hide" : "Show"}
        </span>
      </button>

      {/* Animated list area */}
      <AnimatePresence initial={false}>
        {isListOpen && (
          <motion.div
            key="task-list"
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={bounceTransition}
            className='mt-1 overflow-hidden flex-1'
          >
            <motion.div
              layout
              className='max-h-60 overflow-y-auto pr-1 scrollbar-hide'
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
                    No tasks added yet!
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