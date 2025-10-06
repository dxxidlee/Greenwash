import React, { useState } from "react";
import JournalModal from "@/components/JournalModal";
import "@/styles/noise-surface.css"; // import once globally (e.g., layout or _app)

export default function Page() {
  const [open, setOpen] = useState(false);
  const entries = [
    { id: "1", date: "05.01.25", title: "Morning Notes", body: "Felt the city exhale after rain…" },
    { id: "2", date: "05.03.25", title: "Studio Log", body: "Prototyped the scanner UI with a softer grid…" },
    { id: "3", date: "05.05.25", title: "Field Report", body: "Tested signage on Queensboro approach…" },
  ];

  // Wrap your app root (optional) if you want the no-blur fallback contrast/sat tweak:
  // <div id="appRoot" data-modal-open={open ? 'true' : 'false'}> ... </div>

  return (
    <>
      <button className="px-4 py-2 rounded-full bg-black text-white" onClick={() => setOpen(true)}>
        Open Journal
      </button>
      <JournalModal open={open} onClose={() => setOpen(false)} entries={entries} />
    </>
  );
}
