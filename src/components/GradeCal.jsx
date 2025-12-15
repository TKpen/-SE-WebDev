import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bounceTransition, springTransition } from "../hooks/motionTransitions";
import { supabase } from "../lib/supabaseClient";

// ---------- helpers ----------------------------------------------------

function createDefaultWeights() {
  return [
    { id: "homework", label: "Homework", weight: "10" },
    { id: "quiz", label: "Quizzes", weight: "15" },
    { id: "exam", label: "Exams", weight: "40" },
  ];
}

function createCourse(id, label) {
  return {
    id,
    label,
    weights: createDefaultWeights(),
    rows: [], // assignments
    nextRowId: 1,
    result: null, // cached grade %
  };
}

// same core calculation as original component
function computeGrade(weights, rows) {
  let weightedSum = 0;
  let weightTotal = 0;

  for (let i = 0; i < rows.length; i++) {
    const g = parseFloat(rows[i].grade);
    if (isNaN(g)) continue;

    let w = 0;
    for (let j = 0; j < weights.length; j++) {
      if (weights[j].id === rows[i].weightClassId) {
        w = parseFloat(weights[j].weight);
        break;
      }
    }

    weightedSum += g * w;
    weightTotal += w;
  }

  if (weightTotal === 0) {
    return { grade: null, error: "Total weight cannot be zero." };
  }

  return { grade: weightedSum / weightTotal, error: null };
}

// ---------- main component --------------------------------------------

export default function GradeCal({ onDetailsOpenChange }) {
  const [courses, setCourses] = useState(() => [
    createCourse("course-1", "Course 1"),
    createCourse("course-2", "Course 2"),
    createCourse("course-3", "Course 3"),
    createCourse("course-4", "Course 4"),
    createCourse("course-5", "Course 5"),
  ]);

  const [activeCourseId, setActiveCourseId] = useState("course-1");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState("homework");
  const [newRowCategory, setNewRowCategory] = useState("homework");

  // Supabase load/save flag
  const [hasLoaded, setHasLoaded] = useState(false);

  const activeCourse =
    courses.find((c) => c.id === activeCourseId) || courses[0];

  // ---------- Supabase LOAD --------------------------------------------

  useEffect(() => {
    async function loadGradeData() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;

      if (!user) {
        setHasLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_data")
        .select("grade_config")
        .eq("user_id", user.id)
        .single();

      if (!error && data && data.grade_config) {
        const gd = data.grade_config;
        let loadedCourses = null;

        if (Array.isArray(gd.courses)) {
          // new shape
          loadedCourses = gd.courses.map((c, idx) => {
            const base = createCourse(
              c.id || `course-${idx + 1}`,
              c.label || `Course ${idx + 1}`
            );

            const rows = Array.isArray(c.rows) ? c.rows : [];
            let maxId = 0;
            rows.forEach((r) => {
              if (typeof r.id === "number" && r.id > maxId) maxId = r.id;
            });

            return {
              ...base,
              ...c,
              id: base.id,
              label: base.label,
              weights:
                Array.isArray(c.weights) && c.weights.length > 0
                  ? c.weights
                  : base.weights,
              rows,
              nextRowId: c.nextRowId || maxId + 1,
              result:
                typeof c.result === "number" && !Number.isNaN(c.result)
                  ? c.result
                  : null,
            };
          });
        } else if (
          Array.isArray(gd.weightClasses) &&
          Array.isArray(gd.rows)
        ) {
          // old shape: single course data
          const rows = gd.rows || [];
          let maxId = 0;
          rows.forEach((r) => {
            if (typeof r.id === "number" && r.id > maxId) maxId = r.id;
          });

          const firstCourse = {
            id: "course-1",
            label: "Course 1",
            weights: gd.weightClasses,
            rows,
            nextRowId: maxId + 1,
            result: null,
          };

          const rest = [2, 3, 4, 5].map((n) =>
            createCourse(`course-${n}`, `Course ${n}`)
          );

          loadedCourses = [firstCourse, ...rest];
        }

        if (loadedCourses && loadedCourses.length > 0) {
          setCourses(loadedCourses);
          setActiveCourseId(loadedCourses[0].id);
        }
      }

      setHasLoaded(true);
    }

    loadGradeData();
  }, []);

  // ---------- Supabase SAVE --------------------------------------------

  useEffect(() => {
    if (!hasLoaded) return;

    async function saveGradeData() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;
      if (!user) return;

      await supabase.from("user_data").upsert({
        user_id: user.id,
        grade_config: {
          courses, // new shape
        },
        updated_at: new Date().toISOString(),
      });
    }

    saveGradeData();
  }, [courses, hasLoaded]);

  // ---------- UI helpers -----------------------------------------------

  function safePercent(value) {
    if (value == null || isNaN(value)) return 0;
    let p = value;
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    return p;
  }

  const toggleDetails = () => {
    setIsDetailsOpen((prev) => {
      const next = !prev;
      if (typeof onDetailsOpenChange === "function") {
        onDetailsOpenChange(next);
      }
      return next;
    });
  };

  // helper to update currently selected course
  function updateActiveCourse(updater) {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === activeCourseId ? updater(course) : course
      )
    );
  }

  // ---------- handlers for active course -------------------------------

  function handleCourseLabelChange(courseId, newLabel) {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, label: newLabel } : course
      )
    );
  }

  function handleCategoryChange(catId, field, value) {
    setActiveCategoryId(catId);
    updateActiveCourse((course) => {
      const weights = course.weights.map((w) =>
        w.id === catId ? { ...w, [field]: value } : w
      );
      return { ...course, weights };
    });
  }

  function handleRowChange(rowId, field, value) {
    updateActiveCourse((course) => {
      const rows = course.rows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      );
      return { ...course, rows };
    });
  }

  function handleAddRow(newRowCategoryId) {
    updateActiveCourse((course) => {
      const newRow = {
        id: course.nextRowId,
        name: "",
        grade: "",
        weightClassId:
          newRowCategoryId || (course.weights[0]?.id ?? "homework"),
        editing: true,
      };
      return {
        ...course,
        rows: [newRow, ...course.rows],
        nextRowId: course.nextRowId + 1,
      };
    });
  }

  function deleteRow(id) {
    updateActiveCourse((course) => ({
      ...course,
      rows: course.rows.filter((row) => row.id !== id),
    }));
  }

  function toggleEdit(id) {
    updateActiveCourse((course) => ({
      ...course,
      rows: course.rows.map((row) =>
        row.id === id ? { ...row, editing: !row.editing } : row
      ),
    }));
  }

  function handleCalculateActive() {
    if (!activeCourse) return;

    const { grade, error: calcError } = computeGrade(
      activeCourse.weights,
      activeCourse.rows
    );

    if (calcError) {
      setError(calcError);
    } else {
      setError(null);
    }

    setCourses((prev) =>
      prev.map((course) =>
        course.id === activeCourseId ? { ...course, result: grade } : course
      )
    );
  }

  // keep newRowCategory valid when active course changes
  useEffect(() => {
    if (!activeCourse) return;
    if (!activeCourse.weights.find((w) => w.id === newRowCategory)) {
      setNewRowCategory(activeCourse.weights[0]?.id ?? "homework");
    }
  }, [activeCourse, newRowCategory]);

  // ----------  final render ---------------------------------------------------

  return (
    <div className="p-4 text-sm text-gray-200 w-full h-full flex flex-col">
      {/* HEADER: class summary bars + toggle */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">
            Class Overview
          </p>
          <p className="text-[11px] text-gray-400">
            Quick glance at each course&apos;s current grade
          </p>
        </div>

        <button
          type="button"
          onClick={toggleDetails}
          className="text-xs px-3 py-1 rounded-md border border-gray-600 bg-gray-800 hover:bg-cyan-700 hover:border-cyan-500 transition text-gray-100"
        >
          {isDetailsOpen ? "Hide details ▲" : "Show details ▼"}
        </button>
      </div>

      {/* TOP BARS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        {courses.map((course) => {
          const percent = safePercent(course.result ?? 0);
          return (
            <div
              key={course.id}
              className={`flex flex-col gap-1 p-2 rounded-lg border ${
                course.id === activeCourseId
                  ? "border-cyan-500 bg-gray-900"
                  : "border-gray-700 bg-gray-900/70"
              } cursor-pointer`}
              onClick={() => setActiveCourseId(course.id)}
            >
              <input
                value={course.label}
                onChange={(e) =>
                  handleCourseLabelChange(course.id, e.target.value)
                }
                className="w-full bg-transparent text-xs font-semibold focus:outline-none border-b border-transparent focus:border-cyan-500 pb-0.5"
              />
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>
                  {course.result != null
                    ? `${course.result.toFixed(1)}%`
                    : "No grade yet"}
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={springTransition}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILS PANEL (collapsible) */}
      <AnimatePresence initial={false}>
        {isDetailsOpen && activeCourse && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={bounceTransition}
            className="overflow-hidden flex-1"
          >
            <div className="h-full flex flex-col md:flex-row gap-4">
              {/* LEFT: "folders" for classes */}
              <aside className="md:w-52 w-full bg-gray-900 border border-gray-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-300 mb-2">
                  Classes
                </p>
                <ul className="space-y-1 text-xs">
                  {courses.map((course) => (
                    <li
                      key={course.id}
                      onClick={() => setActiveCourseId(course.id)}
                      className={`px-2 py-1 rounded-md cursor-pointer flex items-center gap-2 transition ${
                        course.id === activeCourseId
                          ? "bg-cyan-800 text-white border-l-4 border-cyan-400"
                          : "hover:bg-gray-800 text-gray-200"
                      }`}
                    >
                      <span>📁</span>
                      <span className="truncate">{course.label}</span>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* RIGHT: active course details */}
              <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col">
                {/* Weight categories */}
                <div className="mb-4 border-b border-gray-700 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold mb-2">
                      Edit Weight Categories - {activeCourse.label}
                    </p>
                    <span className="text-[11px] text-gray-400">
                      Total weights should add up to 100
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeCourse.weights.map((c) => {
                      const isActive = c.id === activeCategoryId;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setActiveCategoryId(c.id)}
                          className={`flex flex-col sm:flex-row gap-3 p-2 rounded-md border transition-colors ${
                            isActive
                              ? "border-cyan-500 bg-cyan-950/40"
                              : "border-gray-700 bg-gray-950/60 hover:bg-gray-900"
                          }`}
                        >
                          <input
                            type="text"
                            value={c.label}
                            onChange={(e) =>
                              handleCategoryChange(c.id, "label", e.target.value)
                            }
                            onFocus={() => setActiveCategoryId(c.id)}
                            className="border border-gray-700 px-2 py-1 rounded text-xs bg-gray-900 text-gray-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-full"
                          />

                          <div className="flex items-center gap-2 sm:w-40">
                            <span className="text-[11px] text-gray-400">
                              Weight (%)
                            </span>
                            <input
                              type="number"
                              value={c.weight}
                              onChange={(e) =>
                                handleCategoryChange(
                                  c.id,
                                  "weight",
                                  e.target.value
                                )
                              }
                              onFocus={() => setActiveCategoryId(c.id)}
                              className="border border-gray-700 px-2 py-1 rounded text-xs bg-gray-900 text-gray-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assignment table heading */}
                <div className="grid grid-cols-1 sm:grid-cols-4 font-semibold px-2 text-xs uppercase text-gray-400 mb-1">
                  <p>Assignment</p>
                  <p className="sm:text-center mt-1 sm:mt-0">Grade (%)</p>
                  <p className="sm:text-center mt-1 sm:mt-0">Category</p>
                  <p className="sm:text-center mt-1 sm:mt-0">Actions</p>
                </div>

                {/* Rows grouped by category */}
                <div className="flex-1 overflow-y-auto mt-1 pr-1 scrollbar-hide">
                  {activeCourse.weights.map((cat) => {
                    const catRows = activeCourse.rows.filter(
                      (r) => r.weightClassId === cat.id
                    );
                    if (catRows.length === 0) return null;

                    const isActiveCat = cat.id === activeCategoryId;

                    return (
                      <div
                        key={cat.id}
                        className={`mt-3 rounded-lg p-2 transition-colors ${
                          isActiveCat
                            ? "bg-cyan-900/20 border border-cyan-600"
                            : "bg-gray-900/60 border border-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-200">
                            {cat.label}
                          </p>
                          {isActiveCat && (
                            <span className="text-[10px] text-cyan-300 uppercase tracking-wide">
                              Active category
                            </span>
                          )}
                        </div>

                        {catRows.map((row) => (
                          <div
                            key={row.id}
                            className={`grid grid-cols-1 sm:grid-cols-4 gap-3 p-2 rounded-md border mb-2 ${
                              row.editing
                                ? "border-cyan-600 bg-gray-950"
                                : "border-gray-700 bg-gray-900/80"
                            }`}
                          >
                            {/* Assignment */}
                            <input
                              type="text"
                              value={row.name}
                              disabled={!row.editing}
                              onChange={(e) =>
                                handleRowChange(row.id, "name", e.target.value)
                              }
                              className={`border px-3 py-2 rounded bg-gray-900 w-full text-sm text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ${
                                !row.editing && "opacity-60 cursor-not-allowed"
                              }`}
                              placeholder="Assignment name"
                              onFocus={() =>
                                setActiveCategoryId(row.weightClassId)
                              }
                            />

                            {/* Grade */}
                            <input
                              type="number"
                              value={row.grade}
                              disabled={!row.editing}
                              onChange={(e) =>
                                handleRowChange(row.id, "grade", e.target.value)
                              }
                              className={`border px-3 py-2 rounded text-center bg-gray-900 w-full text-sm text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ${
                                !row.editing && "opacity-60 cursor-not-allowed"
                              }`}
                              placeholder="85"
                              onFocus={() =>
                                setActiveCategoryId(row.weightClassId)
                              }
                            />

                            {/* Category */}
                            <select
                              value={row.weightClassId}
                              disabled={!row.editing}
                              onChange={(e) =>
                                handleRowChange(
                                  row.id,
                                  "weightClassId",
                                  e.target.value
                                )
                              }
                              className={`border px-3 py-2 rounded bg-gray-900 w-full text-sm text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ${
                                !row.editing && "opacity-60 cursor-not-allowed"
                              }`}
                              onFocus={() =>
                                setActiveCategoryId(row.weightClassId)
                              }
                            >
                              {activeCourse.weights.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.label}
                                </option>
                              ))}
                            </select>

                            {/* Actions */}
                            <div className="flex gap-2 justify-end items-center w-full">
                              <button
                                onClick={() => toggleEdit(row.id)}
                                className={`px-3 py-2 rounded text-xs border ${
                                  row.editing
                                    ? "border-cyan-500 text-cyan-300 hover:bg-cyan-800/40"
                                    : "border-gray-600 text-gray-200 hover:bg-gray-800"
                                } transition`}
                              >
                                {row.editing ? "Lock" : "Edit"}
                              </button>
                              <button
                                onClick={() => deleteRow(row.id)}
                                className="px-3 py-2 border border-red-500 text-red-400 rounded text-xs hover:bg-red-900/30 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {activeCourse.rows.length === 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                      No assignments yet for this class. Add one below.
                    </p>
                  )}
                </div>

                {/* bottom controls + result */}
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">
                        New row category:
                      </p>
                      <select
                        value={newRowCategory}
                        onChange={(e) => setNewRowCategory(e.target.value)}
                        className="border rounded px-2 py-1 text-xs dark:bg-gray-900"
                      >
                        {activeCourse.weights.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddRow(newRowCategory)}
                        className="secondary-box"
                      >
                        + Add Row
                      </button>
                      <button
                        onClick={handleCalculateActive}
                        className="hero-box"
                      >
                        Calculate
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}

                  {/* active course result bar */}
                  {activeCourse.result != null && (
                    <div className="mt-2">
                      <p className="text-sm mb-1">
                        Current grade for <b>{activeCourse.label}</b>:{" "}
                        <b>{activeCourse.result.toFixed(2)}%</b>
                      </p>
                      <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <motion.div
                          className="hero-box h-full flex items-center justify-center text-[11px] text-white"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${safePercent(activeCourse.result)}%`,
                          }}
                          transition={springTransition}
                        >
                          {safePercent(activeCourse.result).toFixed(1)}%
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
