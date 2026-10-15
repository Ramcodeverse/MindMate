import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  User as UserIcon, 
  RotateCcw, 
  Info, 
  Heart, 
  PhoneCall 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { ChatMessage } from '../types';

export const AIReflection: React.FC = () => {
  const { user, updateUserPreferences } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [providerTag, setProviderTag] = useState<string>('gemini');
  const [contextSharing, setContextSharing] = useState<boolean>(
    user?.preferences?.aiContextSharing ?? true
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial conversation
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const conv = await api.getAIConversation();
        setMessages(conv.messages.filter(m => m.role !== 'system'));
      } catch (err) {
        console.error('Failed to load conversation:', err);
      }
    };
    loadConversation();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `local_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const res = await api.sendAIMessage(textToSend.trim());
      setProviderTag(res.provider);
      setMessages(res.updatedConversation.messages.filter(m => m.role !== 'system'));
    } catch (err) {
      console.error('Failed to get AI reply:', err);
      // Gentle offline fallback message in case of network issue
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "I am taking a gentle pause right now. Take a deep, slow breath. I will be ready to listen again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear conversation history? This cannot be undone.')) {
      await api.clearAIConversation();
      setMessages([
        {
          id: 'welcome_fresh',
          role: 'assistant',
          content: "Your space has been reset. Take a quiet breath. What would you like to reflect on today?",
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  };

  const toggleContext = async () => {
    const nextVal = !contextSharing;
    setContextSharing(nextVal);
    await updateUserPreferences({ aiContextSharing: nextVal });
  };

  const reflectionPrompts = [
    "I'm feeling overwhelmed by expectations today.",
    "Help me celebrate a quiet accomplishment.",
    "Guide me through a grounding exercise for anxiety.",
    "How can I set softer boundaries around my work hours?"
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Empathetic Dialogue</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{providerTag === 'gemini' ? 'Gemini 3.8 Flash Active' : 'Offline Sanctuary Engine'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#163327] mt-1">
            AI Reflection Companion
          </h2>
          <p className="text-sm text-[#4E6B5D] mt-0.5">
            A compassionate sounding board for active listening, mindful reframing, and emotional grounding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleContext}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              contextSharing
                ? 'bg-[#EAF2EC] text-[#2D5A46] border-[#2D5A46]'
                : 'bg-white text-[#5C7A6D] border-[#E0E8E2]'
            }`}
            title="When active, companion knows your recent mood & habits"
          >
            Context Sharing: {contextSharing ? 'Enabled' : 'Off'}
          </button>

          <button
            onClick={handleClear}
            className="p-2 text-stone-400 hover:text-stone-700 bg-white border border-[#E0E8E2] rounded-xl hover:bg-stone-50 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Non-Clinical Wellness Notice */}
      <div className="bg-[#EAF2EC]/60 border border-[#D5E3DA] rounded-2xl px-5 py-3 flex items-start gap-3 text-xs text-[#3E5C4E]">
        <Info className="w-4 h-4 text-[#2D5A46] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Wellness Notice:</strong> MindMate's Reflection Companion is an AI wellness sounding board, not a licensed medical therapist. It does not diagnose conditions or prescribe treatments. If you ever feel in immediate danger, please dial <strong>988</strong> (US/Canada) or reach out to emergency services.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-[#E5EDE7] shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCrisis = msg.isCrisisResponse;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isUser ? 'bg-[#2D5A46]' : isCrisis ? 'bg-amber-600' : 'bg-[#3B7258]'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : isCrisis ? <PhoneCall className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#2D5A46] text-white rounded-tr-xs'
                      : isCrisis
                      ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-xs'
                      : 'bg-[#F4F7F5] text-[#163327] border border-[#E2EBE5] rounded-tl-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-2xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-[#3B7258] text-white flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div className="bg-[#F4F7F5] border border-[#E2EBE5] p-3.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2D5A46] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#2D5A46] animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#2D5A46] animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reflection Prompts Tray */}
        <div className="px-6 py-2 bg-[#F9FAF8] border-t border-[#E8ECE6] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-[#5C7A6D] uppercase shrink-0">
            Starters:
          </span>
          {reflectionPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs text-[#2D5A46] bg-white border border-[#D5E3DA] hover:border-[#2D5A46] px-3 py-1 rounded-full whitespace-nowrap transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5EDE7]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="What thoughts or feelings are present right now? Press Enter to reflect..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs sm:text-sm bg-[#F9FAF8] border border-[#E0E8E2] rounded-2xl px-4 py-3 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3 bg-[#2D5A46] text-white rounded-2xl hover:bg-[#234739] shadow-xs transition-all disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIReflection;
