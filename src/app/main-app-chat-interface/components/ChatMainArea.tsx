'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import {
  Menu,
  Sparkles,
  Send,
  ChevronDown,
  Download,
  Share2,
} from 'lucide-react';

import { toast } from 'sonner';

import TitleCards from './TitleCards';
import HookCards from './HookCards';
import ScriptCard from './ScriptCard';

type ChatStep = 'idle' | 'titles' | 'hooks' | 'script' | 'done';

interface Message {
  id: string;
  role: 'user' | 'ai';
  type: 'text' | 'titles' | 'hooks' | 'script';
  content?: string;
  data?: unknown;
  timestamp: string;
}

const platforms = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Twitter/X',
];

const tones = [
  'Casual',
  'Professional',
  'Storytelling',
  'Educational',
  'Hype',
];

const durations = [
  'Shorts (< 60s)',
  'Medium (3-8 min)',
  'Long (8-20 min)',
  'Custom',
];

interface Props {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeChatId: string;
  onChatSaved?: (title: string, platform: string) => void;
}

export default function ChatMainArea({
  sidebarOpen,
  onToggleSidebar,
  activeChatId,
  onChatSaved,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<ChatStep>('idle');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'YouTube',
  ]);

  const [selectedTone, setSelectedTone] =
    useState('Casual');

  const [selectedDuration, setSelectedDuration] =
    useState('Medium (3-8 min)');

  const [showControls, setShowControls] =
    useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setStep('idle');
    setSelectedTitle('');
  };

  const addAiMessage = (
    msg: Omit<Message, 'id' | 'timestamp'>
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: `msg-ai-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(
          'en-US',
          {
            hour: 'numeric',
            minute: '2-digit',
          }
        ),
      },
    ]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'user',
        type: 'text',
        content,
        timestamp: new Date().toLocaleTimeString(
          'en-US',
          {
            hour: 'numeric',
            minute: '2-digit',
          }
        ),
      },
    ]);
  };

  const callApi = async (
    idea: string,
    forceType: string
  ) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idea,
        forceType,
      }),
    });

    return res.json();
  };

  const handleSendWithText = useCallback(
    async (overrideText?: string) => {
      const userInput = (
        overrideText ?? inputValue
      ).trim();

      if (!userInput) return;

      setInputValue('');

      addUserMessage(userInput);

      setIsTyping(true);

      try {
        // STEP 1 → Generate Titles
        if (step === 'idle') {
          const data = await callApi(
            userInput,
            'titles'
          );

          setIsTyping(false);

          addAiMessage({
            role: 'ai',
            type: 'titles',
            content:
              '🎯 Here are 6 viral titles for your video! Click the one you love:',
            data: data.titles,
          });

          setStep('titles');

          // ✅ Save chat
          if (onChatSaved) {
            onChatSaved(
              userInput,
              selectedPlatforms[0]
            );
          }

          return;
        }

        // STEP 2 → Generate Hooks
        if (step === 'titles') {
          setSelectedTitle(userInput);

          const data = await callApi(
            userInput,
            'hooks'
          );

          setIsTyping(false);

          addAiMessage({
            role: 'ai',
            type: 'hooks',
            content:
              '🪝 Here are 3 powerful hooks! Click the one that fits your energy:',
            data: data.hooks,
          });

          setStep('hooks');

          return;
        }

        // STEP 3 → Generate Script
        if (step === 'hooks') {
          const scriptPrompt = `
Title: "${selectedTitle}".
Hook: "${userInput}".
Platform: ${selectedPlatforms.join(', ')}.
Tone: ${selectedTone}.
Duration: ${selectedDuration}.
`;

          const data = await callApi(
            scriptPrompt,
            'script'
          );

          setIsTyping(false);

          addAiMessage({
            role: 'ai',
            type: 'script',
            content:
              '📝 Here is your full script! Edit any section or ask me to refine it.',
            data: data.result,
          });

          setStep('done');

          return;
        }

        // STEP 4 → Refine Script
        if (step === 'done') {
          const refinePrompt = `
Previous script topic: "${selectedTitle}".
User request: "${userInput}".
Tone: ${selectedTone}.
`;

          const data = await callApi(
            refinePrompt,
            'script'
          );

          setIsTyping(false);

          addAiMessage({
            role: 'ai',
            type: 'script',
            content:
              '✨ Here is your refined script!',
            data: data.result,
          });

          return;
        }
      } catch (error) {
        setIsTyping(false);

        addAiMessage({
          role: 'ai',
          type: 'text',
          content:
            'Something went wrong. Please try again!',
        });
      }
    },
    [
      inputValue,
      step,
      selectedTitle,
      selectedPlatforms,
      selectedTone,
      selectedDuration,
      onChatSaved,
    ]
  );

  const handleSend = () => {
    handleSendWithText();
  };

  const handleTitleSelect = useCallback(
    (title: string) => {
      handleSendWithText(title);
    },
    [handleSendWithText]
  );

  const handleHookSelect = useCallback(
    (hook: string) => {
      handleSendWithText(hook);
    },
    [handleSendWithText]
  );

  const handleKeyDown = (
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    if (step === 'idle') {
      return 'What is your video about? e.g. "5 AI tools for students"';
    }

    if (step === 'titles') {
      return 'Or type a title manually...';
    }

    if (step === 'hooks') {
      return 'Or type a hook manually...';
    }

    if (step === 'done') {
      return 'Ask me to refine, make shorter, change tone...';
    }

    return 'Tell VYRO what to create...';
  };

  const getStepLabel = () => {
    if (step === 'idle') {
      return 'New Chat — Tell VYRO your video topic';
    }

    if (step === 'titles') {
      return 'Step 2 — Pick a title';
    }

    if (step === 'hooks') {
      return 'Step 3 — Pick a hook';
    }

    return '🎉 Script ready — refine anytime!';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* TOPBAR */}
      <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#080812]/80 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
          >
            <Menu size={15} />
          </button>

          <div>
            <h1 className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
              {getStepLabel()}
            </h1>

            <p className="text-[11px] text-white/30">
              {selectedPlatforms.join(', ')} ·{' '}
              {selectedTone} ·{' '}
              {selectedDuration}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all duration-200"
          >
            + New Chat
          </button>

          <button
            onClick={() =>
              setShowControls(!showControls)
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              showControls
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                : 'glass border border-white/8 text-white/50 hover:text-white/70'
            }`}
          >
            <Sparkles size={13} />
            Controls
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${
                showControls ? 'rotate-180' : ''
              }`}
            />
          </button>

          <button
            onClick={() =>
              toast.success(
                'Script exported as PDF'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all duration-200"
          >
            <Download size={13} />
            <span className="hidden sm:inline">
              Export
            </span>
          </button>

          <button
            onClick={() =>
              toast.success('Share link copied!')
            }
            className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-all duration-200"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      {showControls && (
        <div className="px-4 md:px-6 py-3 border-b border-white/5 bg-[#0a0a1a]/50 backdrop-blur-sm animate-slide-up flex-shrink-0">
          <div className="flex flex-wrap gap-4 items-start">

            {/* PLATFORM */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">
                Platform
              </p>

              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() =>
                      togglePlatform(p)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedPlatforms.includes(p)
                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                        : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* TONE */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">
                Tone
              </p>

              <div className="flex flex-wrap gap-1.5">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setSelectedTone(t)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedTone === t
                        ? 'bg-pink-500/20 border border-pink-500/30 text-pink-300'
                        : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* DURATION */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">
                Duration
              </p>

              <div className="flex flex-wrap gap-1.5">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      setSelectedDuration(d)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedDuration === d
                        ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300'
                        : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
