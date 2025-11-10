import { useEffect, useMemo, useState } from "react";

/**
 * Reusable Notes component (Tailwind)
 * Props:
 *  - storageKey: string (localStorage key) default "notes.v1"
 *  - className: string (extra styles)     default ""
 *  - onChange: (notes) => void            optional
 */
export default function Notes({ storageKey = "notes.v1", className = "", onChange }) {
  const [notes, setNotes] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem(storageKey)) || []; 
    } catch { 
      return []; 
    }
  });
  const [activeId, setActiveId] = useState(null);
  const activeNote = useMemo(() => notes.find(n => n.id === activeId) || null, [notes, activeId]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
    onChange?.(notes);
  }, [notes, storageKey, onChange]);

  function createNote() {
    const id = crypto.randomUUID();
    const newNote = { id, title: "Untitled", body: "", updatedAt: Date.now() };
    setNotes(curr => [newNote, ...curr]);
    setActiveId(id);
  }

  function updateNote(partial) {
    if (!activeId) return;
    setNotes(curr => 
      curr.map(n => n.id === activeId ? { ...n, ...partial, updatedAt: Date.now() } : n)
    );
  }

  function deleteNote(id) {
    setNotes(curr => curr.filter(n => n.id !== id));
    if (activeId === id) setActiveId(null);
  }

  return (
    <div className={`w-full h-full overflow-hidden flex ${className}`}>
      {/* Sidebar */}
      <div className="grid grid-cols-[260px_1fr] w-full h-full">
      <aside className="h-full overflow-y-auto pr-2">
        <div className="p-3">
            <button
              onClick={createNote}
              className="blue-box mb-2"
            >
                + New
            </button>
        </div>

        <ul className="space-y-1 text-sm p-2">
          {notes.length === 0 && (
            <li className="text-sm text-gray-500">No notes yet—make one!</li>
          )}
          {notes
            .slice()
            .sort((a,b) => b.updatedAt - a.updatedAt)
            .map(n => (
              <li
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={`group flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer
                  ${n.id === activeId ? "bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{n.title || "Untitled"}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(n.updatedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  title="Delete"
                  onClick={(e) => { 
                    e.stopPropagation();
                    deleteNote(n.id); 
                  }}
                >
                  🗑
                </button>
              </li>
            ))}
        </ul>
      </aside>

      {/* Editor */}
      <main className="h-full overflow-y-auto text-sm mt-4 text-gray-800">
        {activeNote ? (
          <>
              <input
                value={activeNote.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                placeholder="Note title…"
                className="w-full text-lg font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1"
              />
              <textarea
                value={activeNote.body}
                onChange={(e) => updateNote({ body: e.target.value })}
                placeholder="Write your note..."
                className="w-full h-full resize-none border border-gray-300 rounded p-3 focus:outline-none focus:ring focus:ring-blue-200"
              />
          </>
        ) : (
          <div className="text-gray-500 p-4">Select a note or create a new one.</div>
        )}
      </main>
      </div>
    </div>
  );
}
