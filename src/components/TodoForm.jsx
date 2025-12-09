import React, { useState } from 'react';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const TodoForm = ({ addTask }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    addTask({
      id: Date.now(),
      text,
      dueDate: dueDate || null,
      priority,
      completed: false,
    });
    
    setText('');
    setDueDate('');
    setPriority('Medium');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <input
        type="text"
        placeholder="New task (e.g., Study for Chem Quiz)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 text-white bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="flex gap-2">
        {/* Priority Dropdown - Keeping standard styling for forms/inputs */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="p-1.5 text-white bg-gray-800 border border-gray-700 rounded-md text-xs cursor-pointer focus:outline-none"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              P: {opt}
            </option>
          ))}
        </select>

        {/* Due Date Input - Keeping standard styling for forms/inputs */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="p-1.5 text-white bg-gray-800 border border-gray-700 rounded-md text-xs focus:outline-none"
        />
        
        {/* Add Task Button - Now using the custom CSS class .hero-box */}
        <button
          type="submit"
          className="hero-box flex-grow"
          // We override the default padding from .hero-box to be more compact here:
          style={{ padding: '6px 12px' }} 
        >
          Add
        </button>
      </div>
    </form>
  );
};

export default TodoForm;