import React from "react";
import GridLayout from "react-grid-layout";
import Notes from "./Notes";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "../styles/modules.tailwind.css"

const layout = [
    { i: "notes", x:0, y:0, w:6, h:6, minH:4},
];

export default function Modules() {
    return (
        <GridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={30}
                width={1200}
                draggableHandle=".module-drag-handle"
            >
                <div key="notes" className="module-box flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="drag-box module-drag-handle sticky top-0 z-10 bg-gray-300 dark:bg-gray-700 p-2">
                        <h2 className="text-sm font-semibold">Notes</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <Notes />
                    </div>
                </div>
            </GridLayout>
    )
}