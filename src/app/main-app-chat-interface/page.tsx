import React from 'react';
import ChatAppLayout from './components/ChatAppLayout';

export default function MainAppChatInterfacePage() {
  return <ChatAppLayout />;
}
import { useState } from "react";

export default function TestAI() {
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
    <div style={{ padding: "20px" }}>
      <input
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Enter idea"
      />

      <button onClick={handleGenerate}>
        Generate AI
      </button>
    </div>
  );
}
