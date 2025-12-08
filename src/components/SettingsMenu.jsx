import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useDarkMode from "../hooks/useDarkMode";
import useDimensions from "../hooks/useDimensions";
import MenuToggle from "./MenuToggle";

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);
  const [isDark, setIsDark] = useDarkMode();

  return (
    <div className="fixed top-6 right-6 z-50">
      <motion.nav
        initial={false}
        animate={isOpen ? "open" : "closed"}
        custom={height}
        ref={containerRef}
        className="relative w-[300px]"
        style={nav}
      >
        <motion.div
          className="absolute right-4 bottom-4 w-[280px] z-10 rounded-2xl"
          variants={sidebarVariants}
          custom={height}
        />
        <motion.ul className="absolute top-8 right-0 w-[150px] z-20 list-none p-4" variants={navVariants}>
          <motion.li variants={itemVariants} className="mb-2">
            <button
              onClick={() => setIsDark(prev => !prev)}
              className="w-full text-sm text-left px-4 py-2 rounded bg-white dark:bg-gray-600 text-black dark:text-white"
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </motion.li>
          <motion.li variants={itemVariants} className="mb-2">
            <Link
              to="/preferences"
              className="block text-sm px-4 py-2 rounded bg-white dark:bg-gray-600 text-black dark:text-white"
            >
              Preferences
            </Link>
          </motion.li>
          <motion.li variants={itemVariants}>
            <Link
              to="/profile"
              className="block text-sm px-4 py-2 rounded bg-white dark:bg-gray-600 text-black dark:text-white"
            >
              Profile
            </Link>
          </motion.li>
        </motion.ul>
        <MenuToggle toggle={() => setIsOpen(prev => !prev)} />
      </motion.nav>
    </div>
  );
}

const sidebarVariants = {
  open: (height = 1000) => ({
    clipPath: "none",
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(30px at 300px 40px)",
    transition: {
      delay: 0.2,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

const navVariants = {
    open: {
        transition: {
            delayChildren: 0.2,
            staggerChildren: 0.07,
        },
    },
    closed: {
        transition: {
            staggerChildren: 0.05,
            staggerDirection: -1,
        },
    },
}

const itemVariants = {
    open: {
        y: 0,
        opacity: 1,
        transition: {
            y: { stiffness: 1000, velocity: -100 },
        },
    },
    closed: {
        y: 50,
        opacity: 0,
        transition: {
            y: { stiffness: 1000 },
        },
    },
}

const Path = (props) => (
    <motion.path
        fill="transparent"
        strokeWidth="3"
        stroke="hsl(0, 0%, 18%)"
        strokeLinecap="round"
        {...props}
    />
)

const container = {
    position: "relative",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "280px",
    height: "auto",
    borderRadius: "1rem",
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
}

const nav = {
    width: 300,
    position: "relative",
}

const background = {
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    zIndex: 0,
}

const toggleContainer = {
    outline: "none",
    border: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    cursor: "pointer",
    position: "absolute",
    top: 18,
    left: 15,
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "transparent",
    zIndex: 10,
}

const list = {
    listStyle: "none",
    padding: 25,
    margin: 0,
    position: "absolute",
    top: 80,
    width: 230,
    zIndex: 5,
}

const listItem = {
    marginBottom: 20,
}
