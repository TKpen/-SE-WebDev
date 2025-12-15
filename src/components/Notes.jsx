import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bounceTransition, springTransition } from "../hooks/motionTransitions";
import { supabase } from "../lib/supabaseClient";

// --- Configuration Data ---
const PRIORITY_LABELS = ["Low", "Medium", "High", "Exam/Quiz"];
const PRIORITY_COLORS = {
  Low: "bg-green-600 text-white",
  Medium: "bg-yellow-600 text-white",
  High: "bg-red-600 text-white",
  "Exam/Quiz": "bg-cyan-600 text-white",
};

// Helper function to generate a simple, time-based ID
function generateSimpleId() {
  return "note-" + Date.now() + Math.random().toString(16).slice(2);
}

// --- Main Component ---
export default function Notes({
  className = "",
  onEditorOpenChange,
}) {
  // all notes + folders live in this one object
  const [data, setData] = useState({
    notes: [],
    folders: ["Class 101", "Project A"],
  });

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeFolderFilter, setActiveFolderFilter] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // to avoid overwriting Supabase data before the first load
  const [hasLoaded, setHasLoaded] = useState(false);

  function setEditorOpen(next) {
    setIsEditorOpen((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      if (typeof onEditorOpenChange === "function") {
        onEditorOpenChange(value);
      }
      return value;
    });
  }

  // LOAD FROM SUPABASE 
  useEffect(() => {
    async function loadNotes() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;

      if (!user) {
        setHasLoaded(true);
        return;
      }

      const { data: row, error } = await supabase
        .from("user_data")
        .select("notes")
        .eq("user_id", user.id)
        .single();

      if (!error && row && row.notes) {
        setData(row.notes);
      }

      setHasLoaded(true);
    }

    loadNotes();
  }, []);

  // SAVE TO SUPABASE 
  useEffect(() => {
    if (!hasLoaded) return;

    async function saveNotes() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;
      if (!user) return;

      await supabase.from("user_data").upsert({
        user_id: user.id,
        notes: data,
        updated_at: new Date().toISOString(),
      });
    }

    saveNotes();
  }, [data, hasLoaded]);

  const activeNote = data.notes.find((n) => n.id === activeNoteId);

  // --- Core Logic Functions ---

  function createFolder() {
    const name = prompt("Enter the name for the new folder:");
    if (!name) return;

    const newFolderName = name.trim();
    if (!newFolderName) return;

    if (data.folders.includes(newFolderName)) {
      alert("Folder already exists!");
      return;
    }

    setData((currentData) => ({
      ...currentData,
      folders: [...currentData.folders, newFolderName],
    }));
    setActiveFolderFilter(newFolderName);
  }

  function createNote() {
    const id = generateSimpleId();
    const newNote = {
      id: id,
      title: "New Note",
      body: "",
      updatedAt: Date.now(),
      folder:
        activeFolderFilter && activeFolderFilter !== "Uncategorized"
          ? activeFolderFilter
          : null,
      isPinned: false,
      priority: null,
    };

    setData((currentData) => ({
      ...currentData,
      notes: [newNote, ...currentData.notes],
    }));
    setActiveNoteId(id);
    setEditorOpen(true);
  }

  function updateNote(partialUpdate) {
    if (!activeNoteId) return;

    setData((currentData) => {
      const updatedNotes = currentData.notes.map((note) => {
        if (note.id === activeNoteId) {
          return {
            ...note,
            ...partialUpdate,
            updatedAt: Date.now(),
          };
        }
        return note;
      });

      return {
        ...currentData,
        notes: updatedNotes,
      };
    });
  }

  function deleteNote(idToDelete) {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    setData((currentData) => ({
      ...currentData,
      notes: currentData.notes.filter((note) => note.id !== idToDelete),
    }));

    if (activeNoteId === idToDelete) {
      setActiveNoteId(null);
    }
  }

  // Filters and sorts notes
  function getFilteredAndSortedNotes() {
    let list = data.notes.slice();

    if (activeFolderFilter === "Uncategorized") {
      list = list.filter((n) => !n.folder);
    } else if (activeFolderFilter) {
      list = list.filter((n) => n.folder === activeFolderFilter);
    }

    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

    return list;
  }

  const filteredNotes = getFilteredAndSortedNotes();
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  // --- UI Components for Sidebar ---

  const FolderItem = ({ name }) => {
    const isActive = activeFolderFilter === name;
    return (
    <li
      onClick={() => setActiveFolderFilter(name)}
      className={`px-2 py-1.5 rounded-md cursor-pointer text-sm font-medium flex items-center gap-2 transition
        ${
          isActive
            ? "bg-cyan-800/80 text-white border-l-4 border-cyan-500"
            : "hover:bg-gray-800 text-gray-200"
        }`}
    >
      <span>📂</span>
      <span className="truncate">{name}</span>
    </li>
    );
  };

  const NoteListItem = ({ note }) => {
    const isActive = note.id === activeNoteId;

    return (
      <li
        key={note.id}
        onClick={() => {
          setActiveNoteId(note.id);
          setEditorOpen(true);
        }}
        className={`group flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer transition text-xs
          ${
            isActive
              ? "bg-cyan-900/60 border-l-4 border-cyan-500"
              : "hover:bg-gray-800"
          }`}
      >
        <div className="min-w-0">
          <div className="font-semibold truncate flex items-center gap-1 text-gray-100">
            {note.isPinned && (
              <span className="text-[11px] text-cyan-300">📌</span>
            )}
            {note.title || "Untitled"}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5 flex flex-wrap items-center gap-1">
            {note.priority && (
              <span
                className={`inline-block items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  PRIORITY_COLORS[note.priority]
                }`}
              >
                {note.priority}
              </span>
            )}
            <span className="text-gray-500">
              Last updated: {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          title="Delete Note"
          onClick={(e) => {
            e.stopPropagation();
            deleteNote(note.id);
          }}
          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition text-xs px-1"
        >
          🗑
        </button>
      </li>
    );
  };


  // --- Final Render ---

  return (
    <div
      className={`w-full h-full overflow-hidden flex bg-gray-900/40 text-gray-100 ${className}`}
    >
      <div className="flex w-full h-full">
        {/* Sidebar (Folder and Note List) */}
        <aside className="h-full w-[250px] overflow-y-auto scrollbar-hide border-r border-gray-800 bg-gray-900">
          {/* Top buttons */}
          <div className="p-3 border-b border-gray-800">
            <button
              onClick={createNote}
              className="w-full hero-box text-xs font-semibold py-2 mb-2"
            >
              + New Note
            </button>
            <button
              onClick={createFolder}
              className="w-full text-xs font-semibold py-1.5 rounded-md border border-cyan-500 text-cyan-300 bg-gray-900 hover:bg-gray-800 transition"
            >
              + New Folder (Class)
            </button>
          </div>

          <div className="space-y-4 p-3">
            {/* Folder Navigation Section */}
            <div>
              <h3 className="uppercase text-[10px] font-semibold text-gray-400 ml-1 mb-1 tracking-wide">
                Folders / Classes
              </h3>
              <ul className="space-y-1">
                <li
                  onClick={() => setActiveFolderFilter(null)}
                  className={`px-2 py-1.5 rounded-md cursor-pointer text-xs font-semibold flex items-center gap-2 transition
                    ${
                      activeFolderFilter === null
                        ? "bg-cyan-800/80 text-white border-l-4 border-cyan-400"
                        : "hover:bg-gray-800 text-gray-200"
                    }`}
                >
                  <span>🏠</span>
                  <span className="truncate">All Notes</span>
                </li>
                {data.folders.map((name) => (
                  <FolderItem key={name} name={name} />
                ))}
                <li
                  onClick={() => setActiveFolderFilter("Uncategorized")}
                  className={`px-2 py-1.5 rounded-md cursor-pointer text-xs font-semibold flex items-center gap-2 transition
                    ${
                      activeFolderFilter === "Uncategorized"
                        ? "bg-cyan-800/80 text-white border-l-4 border-cyan-400"
                        : "hover:bg-gray-800 text-gray-200"
                    }`}
                >
                  <span>📦</span>
                  <span className="truncate">Uncategorized</span>
                </li>
              </ul>
            </div>

            {/* Note List Section */}
            <div>
              <h3 className="uppercase text-[10px] font-semibold text-gray-400 ml-1 mb-1 tracking-wide flex items-center justify-between">
                <span>Notes</span>
                <span className="text-[10px] text-gray-500">
                  {filteredNotes.length}
                </span>
              </h3>
              <ul className="space-y-1">
                {filteredNotes.length === 0 && (
                  <li className="text-xs text-gray-500 px-2 py-2 rounded-md bg-gray-900/60">
                    No notes here. Create one to get started.
                  </li>
                )}

                {/* Pinned Notes */}
                {pinnedNotes.length > 0 && (
                  <>
                    <h4 className="text-[10px] font-semibold text-cyan-400 ml-1 mt-2 uppercase tracking-wide">
                      📌 Pinned
                    </h4>
                    {pinnedNotes.map((n) => (
                      <NoteListItem key={n.id} note={n} />
                    ))}
                  </>
                )}

                {/* Unpinned Notes */}
                {unpinnedNotes.length > 0 && (
                  <>
                    {pinnedNotes.length > 0 && (
                      <h4 className="text-[10px] font-semibold text-gray-500 ml-1 mt-2 uppercase tracking-wide">
                        Recent
                      </h4>
                    )}
                    {unpinnedNotes.map((n) => (
                      <NoteListItem key={n.id} note={n} />
                    ))}
                  </>
                )}
              </ul>
            </div>
          </div>
        </aside>

        {/* Right side: handle + animated editor panel */}
        <div
          className="h-full flex"
          style={{ width: isEditorOpen ? "auto" : "1rem" }}
        >
          {/* Vertical handle */}
          <button
            type="button"
            onClick={() => setEditorOpen((prev) => !prev)}
            className="group relative z-10 flex items-center justify-center w-4 bg-gray-900 hover:bg-cyan-700 border-l border-gray-800 transition-colors"
            title={isEditorOpen ? "Collapse editor" : "Expand editor"}
          >
            <span className="text-xs text-gray-300 group-hover:text-white">
              {isEditorOpen ? "›" : "‹"}
            </span>
          </button>

          {/* Editor panel */}
          <motion.main
            className="h-full flex flex-col bg-gray-900 origin-left"
            initial={false}
            animate={
              isEditorOpen
                ? { width: "100%", opacity: 1 }
                : { width: 0, opacity: 0 }
            }
            transition={bounceTransition}
            style={{ overflow: "hidden" }}
          >
            <div className="flex-1 flex flex-col p-5">
              <AnimatePresence mode="wait">
                {activeNote ? (
                  <motion.div
                    key={activeNoteId || "editor"}
                    layout
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={bounceTransition}
                    className="flex flex-col h-full"
                  >
                    {/* Note Controls (Folder, Priority, Pin) */}
                    <div className="flex items-center justify-between mb-4 text-xs bg-gray-800 p-3 rounded-lg border border-gray-800">
                      {/* Pin Button */}
                      <button
                        onClick={() =>
                          updateNote({ isPinned: !activeNote.isPinned })
                        }
                        className="px-3 py-1 rounded-md bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-cyan-500 transition font-semibold"
                        title={
                          activeNote.isPinned ? "Unpin Note" : "Pin Note"
                        }
                      >
                        {activeNote.isPinned ? "📌 Pinned" : "📍 Pin"}
                      </button>

                      {/* Folder Selection */}
                      <label className="flex items-center space-x-2 text-gray-300">
                        <span className="font-semibold">Folder:</span>
                        <select
                          value={activeNote.folder || ""}
                          onChange={(e) =>
                            updateNote({ folder: e.target.value || null })
                          }
                          className="p-1 border border-gray-700 rounded bg-gray-900 text-xs text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="">-- Uncategorized --</option>
                          {data.folders.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </label>

                      {/* Priority Selection */}
                      <label className="flex items-center space-x-2 text-gray-300">
                        <span className="font-semibold">Priority:</span>
                        <select
                          value={activeNote.priority || ""}
                          onChange={(e) =>
                            updateNote({ priority: e.target.value || null })
                          }
                          className="p-1 border border-gray-700 rounded bg-gray-900 text-xs text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="">-- None --</option>
                          {PRIORITY_LABELS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {/* Title Input */}
                    <input
                      value={activeNote.title}
                      onChange={(e) => updateNote({ title: e.target.value })}
                      placeholder="Note title..."
                      className="w-full text-2xl font-bold bg-transparent border-b border-gray-800 focus:outline-none focus:border-cyan-500 pb-2 mb-4 text-gray-100"
                    />


                    {/* Body Textarea */}
                    <textarea
                      value={activeNote.body}
                      onChange={(e) => updateNote({ body: e.target.value })}
                      placeholder="Start writing your note here..."
                      className="w-full flex-grow resize-none border border-gray-700 rounded-lg p-4 text-sm bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 scrollbar-hide"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={springTransition}
                    className="flex-1 flex items-center justify-center"
                  >
                    <div className="text-gray-500 p-4 text-center text-sm max-w-sm">
                      ← Select a note from the left, or click{" "}
                      <span className="font-semibold text-cyan-300">
                        New Note
                      </span>{" "}
                      to start writing.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
