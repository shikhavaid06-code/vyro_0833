import React from 'react';
import ChatAppLayout from './components/ChatAppLayout';

export default function MainAppChatInterfacePage() {
  return <ChatAppLayout />;
}
<div style={{ padding: "20px", background: "#111", marginTop: "20px" }}>
  <h2 style={{ color: "white" }}>Test AI (Working)</h2>

  <input
    id="ideaInput"
    placeholder="Enter idea"
    style={{ padding: "10px", width: "60%" }}
  />

  <button
    style={{ padding: "10px", marginLeft: "10px" }}
    onClick={async () => {
      const idea = (document.getElementById("ideaInput") as HTMLInputElement).value;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();
      alert(data.result);
    }}
  >
    Generate AI
  </button>
</div>
