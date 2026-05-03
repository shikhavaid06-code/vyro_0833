import { useState } from "react";
import React from 'react';
import ChatAppLayout from './components/ChatAppLayout';

export default function MainAppChatInterfacePage() {
  return <ChatAppLayout />;
}
const [idea, setIdea] = useState("");
 <input
  value={idea}
  onChange={(e) => setIdea(e.target.value)}
/>

<button onClick={handleGenerate}>
  Generate
</button>
