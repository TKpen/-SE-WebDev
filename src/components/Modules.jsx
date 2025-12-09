import React from "react";
import GridLayout from "react-grid-layout";
import { motion } from "framer-motion";

import Notes from "./Notes";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "../styles/modules.tailwind.css"
import GradeCal from "./GradeCal";
import LinkList from "./LinkList";
import ToDoList from "./TodoList";

const layout = [
    {i: "gradeCalc", x: 0, y: 0, w: 12, h: 4, minH: 4, minW: 12},
    {i: "notes", x: 4, y: 0, w: 8, h: 8, minH: 8, minW: 4},
    {i: "todo", x: 0, y: 6, w: 4, h: 8, minH: 4, minW: 4},
    {i: "linklist", x: 0, y: 6, w: 4, h: 8, minH: 4, minW: 3},
];

const spring = {
    type: "spring",
    stiffness: 350,
    damping: 28,
    mass: 0.6,
}

export default function Modules() {
    const [draggingID, setDraggingId] = React.useState(null)

    return (
        <div>
            <GridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={30}
                width={1200}
                draggableHandle=".module-drag-handle"
                onDragStart={(_layout, oldItem) => {
                    setDraggingId(oldItem.i)
                }}
                onDragStop={() => {
                    setDraggingId(null)
                }}
            >
                <div 
                    key="notes"
                    className="module-box flex flex-col h-full bg-white dark:bg-gray-950 rounded-lg shadow-md overflow-hidden"
                >
                    <motion.div
                        className="flex flex-col h-full"
                        animate={{
                            scale: draggingID === "notes" ? 1.03 : 1,
                            boxShadow:
                                draggingID === "notes"
                                ? "0 18px 40px rgba(0,0,0,0.35)"
                                : "0 4px 15px rgba(0,0,0,0.15)",
                        }}
                        transition={spring}
                    >
                        <div className="drag-box module-drag-handle sticky top-0 z-10 bg-gray-300 dark:bg-gray-800 p-2">
                            <h2 className="text-sm font-semibold">Notes</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <Notes />
                        </div>
                    </motion.div>
                </div>

                <div
                    key="todo"
                    className="module-box flex flex-col h-full"
                >
                    <motion.div
                        className="flex flex-col h-full"
                        animate={{
                            scale:draggingID === "todo" ? 1.03 : 1,
                            boxShadow:
                            draggingID === "todo"
                                ? "0 18px 40px rgba(0,0,0,0.35)"
                                : "0 4px 15px rgba(0,0,0,0.15)",
                        }}
                        transition={spring}
                        style={{height: "100%"}}
                    >
                        <div className="drag-box module-drag-handle flex-none sticky top-0 z-10">
                            <h2 className="text-sm font-semibold p-2">To-Do</h2>
                            <span className="text-xs text-gray-600 p-2">...</span>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <ToDoList />
                        </div>
                    </motion.div>
                </div>

                <div
                    key="linklist"
                    className="module-box flex flex-col h-full"
                >
                    <motion.div
                        className="flex flex-col h-full"
                        animate={{
                            scale:draggingID === "linklist" ? 1.03 : 1,
                            boxShadow:
                            draggingID === "linklist"
                                ? "0 18px 40px rgba(0,0,0,0.35)"
                                : "0 4px 15px rgba(0,0,0,0.15)",
                        }}
                        transition={spring}
                        style={{height: "100%"}}
                    >
                        <div className="drag-box module-drag-handle flex-none sticky top-0 z-10">
                            <h2 className="text-sm font-semibold p-2">Links</h2>
                            <span className="text-xs text-gray-600 p-2">...</span>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <LinkList />
                        </div>
                    </motion.div>
                </div>

                <div
                    key="gradeCalc"
                    className="module-box flex flex-col h-full"
                >
                    <motion.div 
                        className="flex flex-col h-full"
                        animate={{
                            scale: draggingID === "gradeCalc" ? 1.03 : 1,
                            boxShadow:
                                draggingID === "gradeCalc"
                                    ? "0 18px 40px rgba(0,0,0,0.35)"
                                    : "0 4px 15px rgba(0,0,0,0.15",
                        }} 
                        transition={spring}
                        style={{height: "100%"}}
                    >
                        <div className="drag-box module-drag-handle flex-none sticky top-0 z-10">
                            <h2 className="text-sm font-semibold p-2">Grade Calculator</h2>
                            <span className="text-xs text-gray-600 p-2">...</span>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <GradeCal />
                        </div>
                    </motion.div>
                </div>
            </GridLayout>
        </div>
    )
}