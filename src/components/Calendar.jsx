import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthMatrix(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const firstDayIndex = firstOfMonth.getDay(); // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const cells = [];

  // leading blanks
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }

  // actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    cells.push({
      date: d,
      isToday: isSameDay(d, today),
    });
  }

  // pad to full 6 weeks
  while (cells.length < 42) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

// stable local key like 2025-12-09
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(null);

  // { "2025-12-09": [{id, title}, ...], ... }
  const [eventsByDate, setEventsByDate] = useState({});
  const [newEventTitle, setNewEventTitle] = useState("");

  // to avoid overwriting Supabase data before we load it
  const [hasLoaded, setHasLoaded] = useState(false);

  const monthMatrix = buildMonthMatrix(currentMonth);

  const monthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // ========= LOAD FROM SUPABASE =========
  useEffect(() => {
    async function loadCalendar() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;

      if (!user) {
        setHasLoaded(true);
        return;
      }

      const { data: row, error } = await supabase
        .from("user_data")
        .select("calendar_events")
        .eq("user_id", user.id)
        .single();

      if (!error && row && row.calendar_events) {
        setEventsByDate(row.calendar_events);
      }

      setHasLoaded(true);
    }

    loadCalendar();
  }, []);

  // ========= SAVE TO SUPABASE =========
  useEffect(() => {
    if (!hasLoaded) return;

    async function saveCalendar() {
      const res = await supabase.auth.getUser();
      const user = res?.data?.user;
      if (!user) return;

      await supabase.from("user_data").upsert({
        user_id: user.id,
        calendar_events: eventsByDate,
        updated_at: new Date().toISOString(),
      });
    }

    saveCalendar();
  }, [eventsByDate, hasLoaded]);

  const handlePrev = () => {
    setCurrentMonth((prev) => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month - 1, 1);
    });
  };

  const handleNext = () => {
    setCurrentMonth((prev) => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month + 1, 1);
    });
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    const title = newEventTitle.trim();
    if (!title) return;

    const key = formatDateKey(selectedDate);
    setEventsByDate((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        { id: `${key}-${Date.now()}`, title },
      ],
    }));
    setNewEventTitle("");
  };

  const handleDeleteEvent = (key, id) => {
    setEventsByDate((prev) => ({
      ...prev,
      [key]: prev[key].filter((ev) => ev.id !== id),
    }));
  };

  const isSelected = (date) =>
    selectedDate &&
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate();

  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;
  const selectedEvents = selectedKey ? eventsByDate[selectedKey] || [] : [];

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <button
          onClick={handlePrev}
          className="rounded-md px-2 py-1 text-xs font-medium hover:bg-slate-800"
        >
          ◀
        </button>
        <div className="text-sm font-semibold">{monthLabel}</div>
        <button
          onClick={handleNext}
          className="rounded-md px-2 py-1 text-xs font-medium hover:bg-slate-800"
        >
          ▶
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-px bg-slate-800 text-[0.7rem] uppercase tracking-wide">
        {daysShort.map((d) => (
          <div
            key={d}
            className="bg-slate-900 px-1 py-2 text-center font-semibold text-slate-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid flex-1 grid-cols-7 gap-px bg-slate-800 text-xs">
        {monthMatrix.flat().map((cell, idx) => {
          if (!cell) {
            return <div key={idx} className="bg-slate-950" />;
          }

          const { date, isToday } = cell;
          const key = formatDateKey(date);
          const events = eventsByDate[key] || [];
          const selected = isSelected(date);

          return (
            <button
              key={idx}
              onClick={() => handleSelectDate(date)}
              className={[
                "relative flex h-20 w-full flex-col items-start justify-start bg-slate-950 px-1 pt-1 text-[0.7rem] transition",
                "hover:bg-slate-900/80",
                isToday && !selected
                  ? "border border-cyan-400"
                  : "border border-transparent",
                selected
                  ? "bg-cyan-500 text-slate-50 hover:bg-cyan-500/90"
                  : "",
              ].join(" ")}
            >
              {/* Day number */}
              <span
                className={[
                  "inline-flex h-5 w-5 items-center justify-center rounded-full",
                  isToday && !selected ? "font-bold text-cyan-400" : "",
                  selected ? "bg-white/15 font-semibold" : "",
                ].join(" ")}
              >
                {date.getDate()}
              </span>

              {/* Event preview (first 2) */}
              {events.length > 0 && (
                <div className="mt-1 w-full text-left text-[0.6rem] leading-tight">
                  {events.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="truncate">
                      • {ev.title}
                    </div>
                  ))}
                  {events.length > 2 && !selected && (
                    <div className="text-[0.55rem] opacity-70">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date + event list / add form */}
      <div className="border-t border-slate-700 px-3 py-2 text-[0.75rem]">
        {selectedDate ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <div>
                <span className="mr-1 text-slate-400">Selected:</span>
                <span className="font-semibold">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {selectedEvents.length} event
                {selectedEvents.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="max-h-24 space-y-1 overflow-y-auto pr-1">
              {selectedEvents.length === 0 ? (
                <div className="text-xs text-slate-500">
                  No events yet. Add one below.
                </div>
              ) : (
                selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-md bg-slate-900 px-2 py-1 text-xs"
                  >
                    <span className="truncate">{ev.title}</span>
                    <button
                      onClick={() => handleDeleteEvent(selectedKey, ev.id)}
                      className="ml-2 text-[0.65rem] text-slate-400 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleAddEvent}
              className="mt-2 flex items-center gap-1"
            >
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Add event..."
                className="h-7 flex-1 rounded-md bg-slate-900 px-2 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                className="h-7 rounded-md bg-cyan-500 px-2 text-[0.7rem] font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Add
              </button>
            </form>
          </>
        ) : (
          <span className="text-xs text-slate-500">
            Click a day to view and add events.
          </span>
        )}
      </div>
    </div>
  );
}
