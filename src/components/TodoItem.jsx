import React from 'react';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-red-500';
    case 'Medium':
      return 'bg-yellow-500';
    case 'Low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const TodoItem = ({ task, toggleComplete, deleteTask }) => {
  const priorityColor = getPriorityColor(task.priority);

  return (
    <div
      className={`flex items-center justify-between p-2 mb-1 rounded-md transition duration-200 
      ${task.completed ? 'bg-gray-700 opacity-70' : 'bg-gray-800 hover:bg-gray-700'} text-sm`}
    >
      <div className="flex items-center overflow-hidden">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id)}
          className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded mr-3 focus:ring-blue-500 cursor-pointer"
        />

        <div>
          <span className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
            {task.text}
          </span>
          <div className="flex items-center space-x-2 text-xs mt-0.5 text-gray-400">
            {task.dueDate && (
              <span>{task.dueDate}</span>
            )}
            <span className={`flex items-center ${task.dueDate ? 'border-l border-gray-600 pl-2' : ''}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${priorityColor}`}></span>
              {task.priority}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => deleteTask(task.id)}
        className="text-red-400 hover:text-red-500 p-1 ml-2 rounded hover:bg-gray-600 transition"
        aria-label={`Delete task: ${task.text}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default TodoItem;