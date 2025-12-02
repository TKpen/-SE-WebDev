import React, { useEffect, useState } from "react";

// --- Configuration Data ---

// Define the priority labels and their corresponding colors
const PRIORITY_LABELS = ["Low", "Medium", "High", "Exam/Quiz"];
// Updated for better visibility on a dark background
const PRIORITY_COLORS = {
  "Low": "bg-green-600 text-white",
  "Medium": "bg-yellow-600 text-white",
  "High": "bg-red-600 text-white",
  "Exam/Quiz": "bg-cyan-600 text-white",
};

// Helper function to generate a simple, time-based ID (beginner style)
function generateSimpleId() {
  return "note-" + Date.now() + Math.random().toString(16).slice(2);
}

// --- Main Component ---

export default function Notes({ storageKey = "myNotesApp.v1", className = "" }) {
  const [data, setData] = useState(() => {
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Could not load notes from local storage:", error);
    }
    return {
      notes: [],
      folders: ["Class 101", "Project A"],
    };
  });

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeFolderFilter, setActiveFolderFilter] = useState(null);

  // Persistence useEffect
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  const activeNote = data.notes.find(n => n.id === activeNoteId);

  // --- Core Logic Functions  ---

  function createFolder() {
    const name = prompt("Enter the name for the new folder:");
    if (name && name.trim()) {
      const newFolderName = name.trim();
      if (data.folders.includes(newFolderName)) {
        alert("Folder already exists!");
        return;
      }
      
      setData(currentData => ({
        ...currentData,
        folders: [...currentData.folders, newFolderName],
      }));
      setActiveFolderFilter(newFolderName);
    }
  }

  function createNote() {
    const id = generateSimpleId();
    const newNote = {
      id: id,
      title: "New Note",
      body: "",
      updatedAt: Date.now(),
      folder: activeFolderFilter && activeFolderFilter !== "Uncategorized" ? activeFolderFilter : null,
      isPinned: false,
      priority: null,
    };

    setData(currentData => ({
      ...currentData,
      notes: [newNote, ...currentData.notes],
    }));
    setActiveNoteId(id);
  }

  function updateNote(partialUpdate) {
    if (!activeNoteId) return;

    setData(currentData => ({
      ...currentData,
      notes: currentData.notes.map(note => {
        if (note.id === activeNoteId) {
          return {
            ...note,
            ...partialUpdate,
            updatedAt: Date.now(),
          };
        }
        return note;
      }),
    }));
  }

  function deleteNote(idToDelete) {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setData(currentData => ({
        ...currentData,
        notes: currentData.notes.filter(note => note.id !== idToDelete),
      }));
      if (activeNoteId === idToDelete) {
        setActiveNoteId(null);
      }
    }
  }

  // Filters and sorts notes
  function getFilteredAndSortedNotes() {
    let list = data.notes.slice();

    if (activeFolderFilter === "Uncategorized") {
      list = list.filter(n => !n.folder);
    } else if (activeFolderFilter) {
      list = list.filter(n => n.folder === activeFolderFilter);
    }

    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

    return list;
  }

  const filteredNotes = getFilteredAndSortedNotes();
  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  // --- UI Components for Sidebar ---

  const FolderItem = ({ name }) => (
    <li
      onClick={() => setActiveFolderFilter(name)}
      className={`p-2 rounded-lg cursor-pointer text-sm font-medium transition hover:bg-gray-700
        ${activeFolderFilter === name ? "bg-cyan-800 text-white border-l-4 border-cyan-500" : ""}`}
    >
      📂 {name}
    </li>
  );

  const NoteListItem = ({ note }) => (
    <li
      key={note.id}
      onClick={() => setActiveNoteId(note.id)}
      className={`group flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer transition
        ${note.id === activeNoteId ? "bg-cyan-700 border-l-4 border-cyan-500" : "hover:bg-gray-700"}`}
    >
      <div className="min-w-0">
        <div className="font-semibold truncate flex items-center gap-1">
          {note.isPinned && <span className="text-sm text-cyan-400">📌</span>}
          {note.title || "Untitled"}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {note.priority && (
            <span className={`inline-block px-1 rounded text-xs mr-1 ${PRIORITY_COLORS[note.priority]}`}>
              {note.priority}
            </span>
          )}
          Last updated: {new Date(note.updatedAt).toLocaleDateString()}
        </div>
      </div>
      <button
        title="Delete Note"
        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
        className="text-red-400 opacity-0 group-hover:opacity-100 transition"
      >
        🗑
      </button>
    </li>
  );


  // --- Final Render ---

  return (
    <div className={`w-full h-full overflow-hidden flex bg-gray-900 text-white border border-gray-700 ${className}`}>
      <div className="grid grid-cols-[250px_1fr] w-full h-full">

        {/* Sidebar (Folder and Note List) */}
        <aside className="h-full overflow-y-auto pr-3 border-r border-gray-700 bg-gray-800">
          <div className="p-3 border-b border-gray-700">
            <button
              onClick={createNote}
              // Primary Button Style (Cyan)
              className="w-full text-white bg-cyan-600 hover:bg-cyan-700 font-bold py-2 rounded mb-2 transition shadow-md"
            >
              + New Note
            </button>
            <button
              onClick={createFolder}
              // Secondary Button Style (Gray/Cyan border)
              className="w-full text-cyan-400 border border-cyan-500 hover:bg-gray-700 font-semibold py-1 rounded text-sm transition"
            >
              + New Folder (Class)
            </button>
          </div>

          <div className="space-y-4 p-2">

            {/* Folder Navigation Section */}
            <div>
              <h3 className="uppercase text-xs font-bold text-gray-400 ml-2 mb-1">Folders / Classes</h3>
              <ul className="space-y-1 text-sm">
                <li
                  onClick={() => setActiveFolderFilter(null)}
                  className={`p-2 rounded-lg cursor-pointer text-sm font-bold transition hover:bg-gray-700
                    ${activeFolderFilter === null ? "bg-cyan-800 text-white border-l-4 border-cyan-500" : ""}`}
                >
                  🏠 All Notes
                </li>
                {data.folders.map(name => <FolderItem key={name} name={name} />)}
                <li
                  onClick={() => setActiveFolderFilter("Uncategorized")}
                  className={`p-2 rounded-lg cursor-pointer text-sm font-bold transition hover:bg-gray-700
                    ${activeFolderFilter === "Uncategorized" ? "bg-cyan-800 text-white border-l-4 border-cyan-500" : ""}`}
                >
                  📦 Uncategorized
                </li>
              </ul>
            </div>

            {/* Note List Section */}
            <h3 className="uppercase text-xs font-bold text-gray-400 ml-2 mb-1">
              Notes ({filteredNotes.length})
            </h3>
            <ul className="space-y-1">
              {filteredNotes.length === 0 && (
                <li className="text-sm text-gray-400 p-2">No notes here. Create one!</li>
              )}

              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <>
                  <h4 className="text-xs font-semibold text-cyan-400 ml-2 mt-3">📌 Pinned</h4>
                  {pinnedNotes.map(n => <NoteListItem key={n.id} note={n} />)}
                </>
              )}

              {/* Unpinned Notes */}
              {unpinnedNotes.length > 0 && (
                <>
                  {pinnedNotes.length > 0 && <h4 className="text-xs font-semibold text-gray-400 ml-2 mt-3">Recent</h4>}
                  {unpinnedNotes.map(n => <NoteListItem key={n.id} note={n} />)}
                </>
              )}
            </ul>
          </div>
        </aside>

        {/* Editor Panel */}
        <main className="h-full flex flex-col p-6 bg-gray-900">
          {activeNote ? (
            <>
              {/* Note Controls (Folder, Priority, Pin) */}
              <div className="flex items-center justify-between mb-4 text-sm bg-gray-800 p-3 rounded border border-gray-700">
                
                {/* Pin Button */}
                <button
                  onClick={() => updateNote({ isPinned: !activeNote.isPinned })}
                  className="text-sm px-3 py-1 rounded transition hover:bg-gray-700 font-semibold"
                  title={activeNote.isPinned ? "Unpin Note" : "Pin Note"}
                >
                  {activeNote.isPinned ? "📌 Pinned" : "📍 Pin"}
                </button>

                {/* Folder Selection */}
                <label className="flex items-center space-x-2 text-gray-300">
                  <span className="font-semibold">Folder:</span>
                  <select
                    value={activeNote.folder || ""}
                    onChange={(e) => updateNote({ folder: e.target.value || null })}
                    className="p-1 border border-gray-600 rounded bg-gray-900 text-white focus:border-cyan-500"
                  >
                    <option value="">-- Uncategorized --</option>
                    {data.folders.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </label>
                
                {/* Priority Selection */}
                <label className="flex items-center space-x-2 text-gray-300">
                  <span className="font-semibold">Priority:</span>
                  <select
                    value={activeNote.priority || ""}
                    onChange={(e) => updateNote({ priority: e.target.value || null })}
                    className="p-1 border border-gray-600 rounded bg-gray-900 text-white focus:border-cyan-500"
                  >
                    <option value="">-- None --</option>
                    {PRIORITY_LABELS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Title Input */}
              <input
                value={activeNote.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                placeholder="Note title goes here..."
                className="w-full text-3xl font-bold bg-transparent border-b-2 border-gray-700 focus:outline-none 
                focus:border-cyan-500 pb-2 mb-4 text-white"
              />
              
              {/* Body Textarea */}
              <textarea
                value={activeNote.body}
                onChange={(e) => updateNote({ body: e.target.value })}
                placeholder="Start writing your note here..."
                className="w-full flex-grow resize-none border border-gray-600 rounded-lg p-4 text-base bg-gray-800 text-white focus:outline-none 
                focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </>
          ) : (
            <div className="text-gray-400 p-4 text-center mt-20 text-lg">
              ← Select a note from the left, or click **New Note** to start.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
