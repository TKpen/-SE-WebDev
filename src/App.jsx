import Notes from "./components/Notes.jsx";

export default function App() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Notes storageKey="campus.notes" />
    </div>
  );
}