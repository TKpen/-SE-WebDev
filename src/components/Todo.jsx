import React, { useState, useEffect } from 'react'

function ToDoList(){

    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            return JSON.parse(savedTasks);
        } else {
            return [];
        }
    });

    const [newTask, setNewTask] = useState("")

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    function handleInputChange(event){
        setNewTask(event.target.value);
    }

    function addTask(){

        if(newTask.trimEnd() !== ""){
            setTasks(t => [...t, newTask]);
            setNewTask("");
        }
    }

    function deleteTask(index){
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    }

    function moveTaskUp(index){
        if(index > 0){
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index - 1]] = 
            [updatedTasks[index - 1], updatedTasks[index]];
            setTasks(updatedTasks);
        }
    }

    function moveTaskDown(index){
        if(index < tasks.length - 1){
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index + 1]] = 
            [updatedTasks[index + 1], updatedTasks[index]];
            setTasks(updatedTasks);
        }
    }

    return(
    <div className="w-full">

        <div className='flex'>
            <input
                type="text"
                placeholder="Enter a task"
                className="m-4"
                value={newTask}
                onChange={handleInputChange}/>
            <button
                className="m-4 blue-box mb-.5"
                onClick={addTask}>
                Add
            </button>
        </div>

        <ol className="w-full p-3 space-y-1 text-lg">
            {tasks.map((task, index) => 
                <li key={index}>
                    <span className="text-gray-500 dark:text-white">{task}</span>
                        <div className='flex justify-end'>
                            <button
                                className='p-1 cursor-pointer'
                                onClick={() => moveTaskUp(index)}>
                                ↿
                            </button>
                            <button
                                className='cursor-pointer'
                                onClick={() => moveTaskDown(index)}>
                                ⇂
                            </button>
                            <button
                                className='p-1 cursor-pointer'
                                onClick={() => deleteTask(index)}>
                                🗑
                            </button>
                        </div>
                </li>)}
        </ol>
    </div>
    )
}

export default ToDoList