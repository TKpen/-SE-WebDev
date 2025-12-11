// src/components/GradeCal.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function GradeCal() {
  const [weightClasses, setWeightClasses] = useState([
    { id: "homework", label: "Homework", weight: "10" },
    { id: "quiz", label: "Quizzes", weight: "15" },
    { id: "exam", label: "Exams", weight: "40" },
  ]);

  const [rows, setRows] = useState([
    { id: 1, name: "", grade: "", weightClassId: "homework", editing: true }
  ]);

  const [nextId, setNextId] = useState(2);
  const [newRowCategory, setNewRowCategory] = useState("homework");

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // ---------- Supabase state ----------
  const [hasLoaded, setHasLoaded] = useState(false); // don't overwrite cloud on first load

  let percent = result || 0;
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;

  // ============ LOAD FROM SUPABASE ============
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

        if (gd.weightClasses && Array.isArray(gd.weightClasses)) {
          setWeightClasses(gd.weightClasses);
        }

        if (gd.rows && Array.isArray(gd.rows) && gd.rows.length > 0) {
          setRows(gd.rows);

          // set nextId so new rows don't reuse old ids
          let maxId = 0;
          for (let i = 0; i < gd.rows.length; i++) {
            const r = gd.rows[i];
            if (typeof r.id === "number" && r.id > maxId) {
              maxId = r.id;
            }
          }
          setNextId(maxId + 1);
        }
      }

      setHasLoaded(true);
    }

    loadGradeData();
  }, []);

  // ============ SAVE TO SUPABASE ============
  useEffect(() => {
    if (!hasLoaded) return;

    async function saveGradeData() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;
      if (!user) return;

      await supabase.from("user_data").upsert({
        user_id: user.id,
        grade_config: {
          weightClasses: weightClasses,
          rows: rows,
        },
        updated_at: new Date().toISOString(),
      });
    }

    saveGradeData();
  }, [weightClasses, rows, hasLoaded]);

  // ============ LOCAL HANDLERS ============

  function handleRowChange(rowId, field, value) {
    const copy = [...rows];

    for (let i = 0; i < copy.length; i++) {
      if (copy[i].id === rowId) {
        const updated = { ...copy[i] };
        updated[field] = value;
        copy[i] = updated;
      }
    }

    setRows(copy);
  }

  function handleAddRow() {
    const newRow = {
      id: nextId,
      name: "",
      grade: "",
      weightClassId: newRowCategory,
      editing: true
    };

    setRows([newRow, ...rows]);
    setNextId(nextId + 1);
  }

  function deleteRow(id) {
    const copy = [];

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].id !== id) copy.push(rows[i]);
    }

    setRows(copy);
  }

  function toggleEdit(id) {
    const copy = [...rows];

    for (let i = 0; i < copy.length; i++) {
      if (copy[i].id === id) {
        const updated = { ...copy[i] };
        updated.editing = !updated.editing;
        copy[i] = updated;
      }
    }

    setRows(copy);
  }

  function handleCategoryChange(catId, field, value) {
    const list = [];

    for (let i = 0; i < weightClasses.length; i++) {
      const c = weightClasses[i];
      if (c.id === catId) {
        const u = { ...c };
        u[field] = value;
        list.push(u);
      } else list.push(c);
    }

    setWeightClasses(list);
  }

  function handleCalculate() {
    let weightedSum = 0;
    let weightTotal = 0;

    for (let i = 0; i < rows.length; i++) {
      const g = parseFloat(rows[i].grade);
      if (isNaN(g)) continue;

      let w = 0;
      for (let j = 0; j < weightClasses.length; j++) {
        if (weightClasses[j].id === rows[i].weightClassId) {
          w = parseFloat(weightClasses[j].weight);
        }
      }

      weightedSum += g * w;
      weightTotal += w;
    }

    if (weightTotal === 0) {
      setError("Total weight cannot be zero.");
      setResult(null);
      return;
    }

    setError(null);
    setResult(weightedSum / weightTotal);
  }

  // ============ UI ============
  return (
    <div className="p-4 text-sm text-gray-800 dark:text-white w-full">
      {/* EDIT WEIGHT CATEGORIES */}
      <div className="mb-6 border-b pb-4">
        <p className="text-xs font-semibold mb-2">Edit Weight Categories</p>

        {weightClasses.map((c) => (
          <div key={c.id} className="flex flex-col sm:flex-row gap-3 mb-2">
            <input
              type="text"
              value={c.label}
              onChange={(e) =>
                handleCategoryChange(c.id, "label", e.target.value)
              }
              className="border px-2 py-1 rounded text-xs dark:bg-gray-950 w-full"
            />

            <input
              type="number"
              value={c.weight}
              onChange={(e) =>
                handleCategoryChange(c.id, "weight", e.target.value)
              }
              className="border px-2 py-1 rounded text-xs dark:bg-gray-950 w-24"
            />
          </div>
        ))}
      </div>

      {/* TABLE HEADING */}
      <div className="grid grid-cols-1 sm:grid-cols-4 font-semibold px-2 text-xs uppercase">
        <p>Assignment</p>
        <p className="sm:text-center mt-1 sm:mt-0">Grade (%)</p>
        <p className="sm:text-center mt-1 sm:mt-0">Category</p>
        <p className="sm:text-center mt-1 sm:mt-0">Actions</p>
      </div>

      {/* ROWS GROUPED BY CATEGORY */}
      {weightClasses.map((cat) => {
        const catRows = rows.filter((r) => r.weightClassId === cat.id);
        if (catRows.length === 0) return null;

        return (
          <div key={cat.id} className="mt-4">
            <p className="text-xs font-semibold mb-1">{cat.label}</p>

            {catRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-2 border rounded mb-2 dark:bg-gray-900 w-full"
              >
                {/* Assignment */}
                <input
                  type="text"
                  value={row.name}
                  disabled={!row.editing}
                  onChange={(e) =>
                    handleRowChange(row.id, "name", e.target.value)
                  }
                  className={`border px-3 py-2 rounded dark:bg-gray-950 w-full ${
                    !row.editing && "opacity-60 cursor-not-allowed"
                  }`}
                  placeholder="Assignment name"
                />

                {/* Grade */}
                <input
                  type="number"
                  value={row.grade}
                  disabled={!row.editing}
                  onChange={(e) =>
                    handleRowChange(row.id, "grade", e.target.value)
                  }
                  className={`border px-3 py-2 rounded text-center dark:bg-gray-950 w-full ${
                    !row.editing && "opacity-60 cursor-not-allowed"
                  }`}
                  placeholder="85"
                />

                {/* Category */}
                <select
                  value={row.weightClassId}
                  disabled={!row.editing}
                  onChange={(e) =>
                    handleRowChange(row.id, "weightClassId", e.target.value)
                  }
                  className={`border px-3 py-2 rounded dark:bg-gray-950 w-full text-sm ${
                    !row.editing && "opacity-60 cursor-not-allowed"
                  }`}
                >
                  {weightClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                {/* Actions */}
                <div className="flex gap-2 justify-end items-center w-full">
                  <button
                    onClick={() => toggleEdit(row.id)}
                    className="px-3 py-2 border rounded text-xs"
                  >
                    {row.editing ? "Lock" : "Edit"}
                  </button>
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="px-3 py-2 border border-red-400 text-red-600 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* ERROR */}
      {error && <p className="text-red-600 text-xs mt-4">{error}</p>}

      {/* BOTTOM CONTROLS */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold">New row category:</p>
            <select
              value={newRowCategory}
              onChange={(e) => setNewRowCategory(e.target.value)}
              className="border rounded px-2 py-1 text-xs dark:bg-gray-900"
            >
              {weightClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handleAddRow} className="secondary-box">
              + Add Row
            </button>
            <button onClick={handleCalculate} className="hero-box">
              Calculate
            </button>
          </div>
        </div>

        {/* RESULT BAR */}
        {result !== null && (
          <div className="mt-2">
            <p className="text-sm mb-1">
              Current grade: <b>{result.toFixed(2)}%</b>
            </p>

            <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
              <div
                className="hero-box h-full flex items-center justify-center text-[11px] text-white"
                style={{ width: percent + "%" }}
              >
                {percent.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
