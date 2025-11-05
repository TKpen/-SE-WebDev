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
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch { return []; }
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
    setNotes(curr => curr.map(n => n.id === activeId ? { ...n, ...partial, updatedAt: Date.now() } : n));
  }

  function deleteNote(id) {
    setNotes(curr => curr.filter(n => n.id !== id));
    if (activeId === id) setActiveId(null);
  }

  return (
<div className="min-h-screen flex items-center justify-center  ">
    <div
    className={`grid grid-cols-[280px_1fr] gap-4
      w-[90%] max-w-6xl
      rounded-[2rem] border 
      shadow-[0_4px_30px_rgba(0,0,0,0.08)]
      dark:border-gray-700/60 dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]
      transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:scale-[1.01]
      overflow-hidden
      ${className}`}
  >

      {/* Sidebar */}
      <aside className="border-r border-gray-200 pr-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold tracking-tight text-gray-800 font-[system-ui,sans-serif] p-[20px]">Notes</h2>
            <button
            type="button"
            onClick={createNote}
            className="px-4 pyh-10 w-24 bg-blue-700 hover:bg-blue-800-2 rounded-lg text-white font-medium
                        hover:bg-blue-700 active:bg-blue-800
                        bg-blue-600 !bg-blue-600"
            >
            ＋ New
            </button>
        </div>

        <ul className="space-y-1">
          {notes.length === 0 && (
            <li className="text-sm text-gray-500">No notes yet—make one!</li>
          )}
          {notes.slice().sort((a,b) => b.updatedAt - a.updatedAt).map(n => (
            <li
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`group flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer
                         ${n.id === activeId ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{n.title || "Untitled"}</div>
                <div className="text-xs text-gray-500">{new Date(n.updatedAt).toLocaleString()}</div>
              </div>
              <button
                title="Delete"
                onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Editor */}
      <main>
        {activeNote ? (
          <>
            <main>
            {/* TOP TITLE DISPLAY */}
            <div className="pl-[10px] px-6 py-3">
                <h2 className="ml-8 text-3xl font-semibold tracking-tight text-gray-800 font-[system-ui,sans-serif]">
                {activeNote?.title?.trim() || "Untitled"}
                </h2>
            </div>

            {/* BOTTOM FLOATING INPUT BAR */}
            {activeNote && (
                <div
                className="sticky bottom-0 z-20 p-4"
                style={{ marginRight: "20px", marginLeft: "20px" }}
                >
                {/* soft gradient behind the bar */}
                <div className="pointer-events-none h-8  dark:from-slate-950/90" />
                <div
                className="mx-auto w-full max-w-2xl h-[30px] flex items-center gap-2
                            rounded-[0.4rem] border-[1.4px] border-[rgba(77,77,75,0.5)]
                            dark:shadow-[0_4px_18px_rgba(0,0,0,0.15)]"
                >

                <input
                value={activeNote.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                placeholder="Type a note title…"
                aria-label="Note title"
                className="flex-1 bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 text-base px-4 py-3 placeholder:text-gray-400"
                />
                </div>
                </div>
            )}
            </main>
            <div className="p-[20px]">
                <textarea
                value={activeNote.body}
                onChange={(e) => updateNote({ body: e.target.value })}
                placeholder="Write your note..."
                rows={18}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 
                            focus:outline-none focus:ring-2 
                            focus:ring-blue-500 leading-relaxed
                            rounded-[0.4rem] border-[1.4px] border-[rgba(77,77,75,0.5)]
                            dark:shadow-[0_4px_18px_rgba(0,0,0,0.15)]"
                style={{ resize: "none" }}
                />
            </div>
          </>
        ) : (
          <div className="text-gray-500">Select a note or create a new one.</div>
        )}
      </main>
    </div>
</div>
  );
}
