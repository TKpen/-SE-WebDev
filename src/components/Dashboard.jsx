import React from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Notes from "./Notes";
import ToDoList from "./Todo";
import LinkList from "./LinkList";

const layout = [
    {i: "calendar", x: 0, y: 0, w: 6, h: 6},
    {i: "notes", x: 6, y: 0, w: 6, h: 6, minH: 4},
    {i: "todo", x: 6, y: 6, w: 4, h: 8, minH: 3, minW: 3},
]

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="mb-4 text-xl font-bold text-black">Student Organizer Dashboard</h1>

            <GridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={30}
                width={1200}
                draggableHandle=".module-drag-handle"
            >
                <div 
                    key="notes" 
                    className="module-box flex flex-col h-full"
                    style={{height: "100%"}}
                >
                    <div className="drag-box module-drag-handle flex-none sticky top-0 z-10">
                        <h2 className="text-sm font-semibold p-2">Notes</h2>
                        <span className="text-xs text-gray-600 p-2">...</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <Notes />
                    </div>
                </div>

                <div 
                    key="todo" 
                    className="module-box flex flex-col h-full"
                    style={{height: "100%"}}
                >
                    <div className="drag-box module-drag-handle flex-none sticky top-0 z-10">
                        <h2 className="text-sm font-semibold p-2">To-Do</h2>
                        <span className="text-xs text-gray-600 p-2">...</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <ToDoList />
                    </div>
                </div>
                
            </GridLayout>
        </div>
    )
}