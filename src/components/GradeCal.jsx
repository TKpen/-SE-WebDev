import { useState } from "react";

export default function GradeCal() {
  const [rows, setRows] = useState([
    { id: 1, name: "", grade: "", weight: "" },
  ]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        name: "",
        grade: "",
        weight: "",
      },
    ]);
  };

  const handleCalculate = () => {
    const validRows = rows.filter(
      (r) => r.grade.trim() !== "" && r.weight.trim() !== ""
    );

    if (validRows.length === 0) {
      setError("Fill in at least one grade and weight.");
      setResult(null);
      return;
    }

    let totalWeighted = 0;
    let totalWeight = 0;

    for (const row of validRows) {
      const g = parseFloat(row.grade);
      const w = parseFloat(row.weight);

      if (isNaN(g) || isNaN(w)) {
        setError("All grades and weights must be valid numbers.");
        setResult(null);
        return;
      }

      totalWeighted += g * w;
      totalWeight += w;
    }

    if (totalWeight === 0) {
      setError("Total weight cannot be 0.");
      setResult(null);
      return;
    }

    setError(null);
    setResult(totalWeighted / totalWeight);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 text-sm text-gray-800 dark:text-white scrollbar-hide">



      {/* Labels */}
      <div className="grid grid-cols-[1fr_140px_140px] px-2 py-1 text-gray-800 font-semibold dark:text-white">
        <p>ASSIGNMENT / EXAM</p>
        <p className="text-center">GRADE (%)</p>
        <p className="text-center">WEIGHT</p>
      </div>

      {/* Rows */}
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[540px_140px_140px_300px_300px] items-center gap-3 p-2 rounded-lg 
          hover:bg-gray-50 border border-gray-200 mb-2 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          <input
            type="text"
            placeholder="Assignment name"
            value={row.name}
            onChange={(e) => handleChange(row.id, "name", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200"
          />

          <input
            type="number"
            placeholder="85"
            value={row.grade}
            onChange={(e) => handleChange(row.id, "grade", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-center w-full focus:outline-none focus:ring focus:ring-blue-200"
          />

          <input
            type="number"
            placeholder="20"
            value={row.weight}
            onChange={(e) => handleChange(row.id, "weight", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-center w-full focus:outline-none focus:ring focus:ring-blue-200"
          />

          {/* Buttons */}
          <div className="p-2 flex gap-2 items-center">
            <button
              onClick={handleAddRow}
              className="secondary-box"
            >
              + Add Row
            </button>

            <button
              onClick={handleCalculate}
              className="hero-box"
            >
              Calculate
            </button>
          </div>
        </div>
      ))}

      {/* Result / Error */}
      <div className="px-2 mt-2">
        {error && <p className="text-red-600 text-xs">{error}</p>}
        {result !== null && !error && (
          <p className="text-gray-800 text-sm dark:text-white">
            Current grade:{" "}
            <span className="font-semibold">{result.toFixed(2)}%</span>
          </p>
        )}
      </div>
    </div>
  );
}
