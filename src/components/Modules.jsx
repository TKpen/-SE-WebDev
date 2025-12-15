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
import Calendar from "./Calendar";
import { bounceTransition, springTransition } from "../hooks/motionTransitions.js";

// Layout mapping
const defaultLayout = [
    {i: "gradeCalc", x: 0, y: 0, w: 12, h: 4, minH: 4, minW: 12, maxH:20, maxW:12},
    {i: "notes", x: 4, y: 0, w: 8, h: 8, minH: 8, minW: 2.75, maxH:16, maxW: 8},
    {i: "todo", x: 0, y: 6, w: 4, h: 8, minH: 4, minW: 4, maxH: 10, maxW: 4},
    {i: "linklist", x: 0, y: 6, w: 4, h: 8, minH: 4, minW: 3, maxH: 8, maxW: 4},
    {i: "calendar", x: 4, y: 6, w: 6, h: 16, minH: 4, minW: 4, maxH:16, maxW: 6},
];

// Spring animation
const spring = {
    type: "spring",
    stiffness: 350,
    damping: 28,
    mass: 0.6,
}

const getModuleAnimation = (id, draggingID) => ({
    scale: draggingID === id ? 1.02 : 1,
    y: draggingID === id ? -6 : 0,
    boxShadow:
        draggingID === id
            ? "0 18px 30px rgba(0,0,0,0.45)" // Visible shadow when grabbed
            : "0 0 0 rgba(0,0,0,0)", // Flat when resting
})

const getNotesAnimation = (draggingID, isNotesEditorOpen) => {
    const base = getModuleAnimation("notes", draggingID);

    if (!isNotesEditorOpen) return base;

    return {
        ...base,
        scale: Math.max(base.scale || 1, 1.01),
        boxShadow:
            "0 20px 40px rgba(0,0,0,0.55)",
    }
}

const getTodoAnimation = (draggingID, isTodoOpen) => {
  const base = getModuleAnimation("todo", draggingID);

  if (!isTodoOpen) return base;

  return {
    ...base,
    scale: Math.max(base.scale || 1, 1.01),
    boxShadow: "0 18px 32px rgba(0,0,0,0.5)",
  };
};

const getGradeCalcAnimation = (draggingID, isGradeDetailsOpen) => {
    const base = getModuleAnimation("gradeCalc", draggingID)

    if (!isGradeDetailsOpen) return base

    return {
        ...base,
        scale: Math.max(base.scale || 1, 1.01),
        boxShadow: "0 20px 40px rgba(0,0,0,0.55)",
    }
}

export default function Modules() {
    const [draggingID, setDraggingId] = React.useState(null)
    const [isNotesEditorOpen, setIsNotesEditorOpen] = React.useState(false)
    const [isTodoOpen, setIsTodoOpen] = React.useState(true)
    const [todoTaskCount, setTodoTaskCount] = React.useState(0)
    const [isGradeDetailsOpen, setIsGradeDetailsOpen] = React.useState(false)

    const [layout, setLayout] = React.useState(defaultLayout)

    // Notes: Change width when editor open/closed
    React.useEffect(() => {
        setLayout((prevLayout) =>
            prevLayout.map((item) =>
                item.i === "notes"
                    ? {...item, w: isNotesEditorOpen ? 8: 2.75}
                    : item
            )
        )
    }, [isNotesEditorOpen])

    // To-do: dynamic height based on open state + task count
    React.useEffect(() => {
        setLayout((prevLayout) => 
            prevLayout.map((item) => {
                if(item.i !== "todo") return item

                const closedH = 5
                const baseOpenH = 7
                const rowsPerTask = 0.6
                const maxH = 18

                if(!isTodoOpen) {
                    return { ...item, h: closedH }
                }

                const extraRows = Math.ceil(todoTaskCount * rowsPerTask)
                const newH = Math.min(baseOpenH + extraRows, maxH)
                return { ...item, h: newH }
            })
        )
    }, [isTodoOpen, todoTaskCount])

    // GradeCalc height depends on details panel
    React.useEffect(() => {
        setLayout((prevLayout) =>
            prevLayout.map((item) =>
                item.i === "gradeCalc"
                    ? {
                        ...item,
                        h: isGradeDetailsOpen ? 19 : 5,
                    }
                : item
            )
        )
    }, [isGradeDetailsOpen])

    // Function that allows modules to change freely where ever on the page
    const handleLayoutChange = React.useCallback(
        (nextLayout) => {
            setLayout((prevLayout) => 
                nextLayout.map((item) => {
                    const prevItem = prevLayout.find((p) => p.i === item.i) || {}
                    return { ...prevItem, ...item }
                })
            )
        },
        []
    )

    return (
        <div>
            <GridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={30}
                width={1200}
                draggableHandle=".module-drag-handle"
                onLayoutChange={handleLayoutChange}
                onDragStart={(_layout, oldItem) => {
                    setDraggingId(oldItem.i)
                }}
                onDragStop={() => {
                    setDraggingId(null)
                }}
            >
                {/* Notes */}
                <div key="notes" className="h-full">
                    <motion.div
                        className="module-box flex flex-col h-full overflow-hidden"
                        animate={getNotesAnimation(draggingID, isNotesEditorOpen)}
                        transition={isNotesEditorOpen ? bounceTransition : spring}
                    >
                        <div className="drag-box module-drag-handle sticky top-0 z-10 bg-gray-800/90 p-2">
                            <h2 className="text-sm font-semibold text-white">Notes</h2>
                            <span className="text-xs text-gray-300 px-2 pb-2">...</span>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <Notes onEditorOpenChange={setIsNotesEditorOpen} />
                        </div>
                    </motion.div>
                </div>

                {/* To-Do List */}
                <div key="todo" className="h-full">
                    <motion.div
                        className="module-box flex flex-col h-full overflow-hidden"
                        animate={getTodoAnimation(draggingID, isTodoOpen)}
                        transition={isTodoOpen ? bounceTransition : spring}
                    >
                        <div className="drag-box module-drag-handle flex-none sticky top-0 z-10 bg-gray-800/90">
                            <h2 className="text-sm font-semibold p-2 text-white">To-Do</h2>
                            <span className="text-xs text-gray-300 px-2 pb-2">...</span>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <ToDoList 
                                onListOpenChange={setIsTodoOpen}
                                onTaskCountChange={setTodoTaskCount}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Links List */}
                <div key="linklist" className="h-full">
                    <motion.div
                        className="module-box flex flex-col h-full overflow-hidden"
                        animate={getModuleAnimation("linklist", draggingID)}
                        transition={spring}
                    >
                        <div className="drag-box module-drag-handle flex-none sticky top-0 z-10 bg-gray-800/90">
                            <h2 className="text-sm font-semibold p-2 text-white">Links</h2>
                            <span className="text-xs text-gray-300 px-2 pb-2">...</span>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <LinkList />
                        </div>
                    </motion.div>
                </div>

                {/* Grade Calculator */}
                <div key="gradeCalc" className="h-full">
                    <motion.div 
                        className={`module-box flex flex-col h-full overflow-hidden ${
                            isGradeDetailsOpen ? "mb-6" : ""
                        }`}
                        animate={getGradeCalcAnimation(draggingID, isGradeDetailsOpen)} 
                        transition={ isGradeDetailsOpen ? bounceTransition : spring }
                    >
                        <div className="drag-box module-drag-handle flex-none sticky top-0 z-10 bg-gray-800/90">
                            <h2 className="text-sm font-semibold p-2 text-white">Grade Calculator</h2>
                            <span className="text-xs text-gray-300 px-2 pb-2">...</span>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <GradeCal
                                onDetailsOpenChange={setIsGradeDetailsOpen}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Calendar */}
                <div key="calendar" className="h-full">
                    <motion.div
                        className="module-box flex flex-col h-full overflow-hidden"
                        animate={getModuleAnimation("calendar", draggingID)}
                        transition={spring}
                    >
                        <div className="drag-box module-drag-handle flex-none sticky top-0 z-10 bg-gray-800/90">
                            <h2 className="text-sm font-semibold p-2 text-white">Calendar</h2>
                            <span className="text-xs text-gray-300 px-2 pb-2">
                                Monthly overview
                            </span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Calendar />
                        </div>
                    </motion.div>
                </div>
            </GridLayout>
        </div>
    )
}