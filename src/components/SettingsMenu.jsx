// src/components/SettingsMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useDarkMode from "../hooks/useDarkMode";
import useDimensions from "../hooks/useDimensions";
import MenuToggle from "./MenuToggle";

export default function SettingsMenu({ user, onLogout }) {
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
        <motion.ul
          className="absolute top-8 right-0 w-[150px] z-20 list-none p-4"
          variants={navVariants}
        >
          {/* <motion.li variants={itemVariants} className="mb-2">
            <button
              onClick={() => setIsDark((prev) => !prev)}
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

          <motion.li variants={itemVariants} className="mb-2">
            <Link
              to="/profile"
              className="block text-sm px-4 py-2 rounded bg-white dark:bg-gray-600 text-black dark:text-white"
            >
              Profile
            </Link>
          </motion.li> */}

          {user && (
            <motion.li variants={itemVariants}>
              <button
                onClick={onLogout}
                className="w-full text-sm text-left px-4 py-2 rounded bg-white dark:bg-gray-600 text-black dark:text-white"
              >
                Log Out
              </button>
            </motion.li>
          )}
        </motion.ul>

        <MenuToggle toggle={() => setIsOpen((prev) => !prev)} />
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
    pointerEvent: "auto",
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.07,
    },
  },
  closed: {
    pointerEvents: "none",
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

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
};

const nav = {
  width: 300,
  position: "relative",
};
