"use client";

import React, { useState } from "react";
import ChatAppLayout from "./components/ChatAppLayout";

export default function MainAppChatInterfacePage() {
  const [idea, setIdea] = useState("");

  const handleGenerate = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idea }),
    });

    const data = await res.json();
    alert(data.result);
  };

  return (
    <div>
      {/* Existing UI */}
      <ChatAppLayout />

      {/* Your test AI section */}
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid gray" }}>
        <h2>Test AI (Working)</h2>

        <input
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Enter idea"
          style={{ padding: "8px" }}
        />

        <button onClick={handleGenerate} style={{ marginLeft: "10px" }}>
          Generate AI
        </button>
      </div>
    </div>
  );
}
