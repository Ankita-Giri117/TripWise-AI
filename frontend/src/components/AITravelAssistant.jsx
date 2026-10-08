import React, { useState, useRef, useEffect } from 'react';
import { askAssistantApi } from '../api/trips';
import {
  Send,
  Bot,
  User,
  RefreshCw,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

const SUGGESTIONS = [
  'What should I do on Day 2?',
  'How can I save money?',
  'Suggest a relaxing evening.',
  'What should I pack?',
  'Which activities in my itinerary are expensive?'
];

const AITravelAssistant = ({ tripId, destination }) => {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I'm your AI Travel Assistant for your trip to ${destination || 'your destination'}. Ask me questions about your day-by-day itinerary, budget tips, packing advice, or local recommendations!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    setError('');
    const userMsgId = Date.now();
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAssistantApi(tripId, messageText);
      const aiReply = response.reply || 'Sorry, I could not process your request at this time.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('AI Assistant API error:', err);
      const errMsg = err.response?.data?.message || 'Failed to get answer from AI Assistant. Please try again.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleSuggestionClick = (suggestionText) => {
    handleSendMessage(suggestionText);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-md flex flex-col h-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-stone-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <span>AI Travel Assistant</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                Context-Aware
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Personalized guidance using current trip details for {destination || 'your destination'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-xs shadow-md shadow-emerald-900/20'
                  : 'bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700/80 rounded-tl-xs shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.timestamp && (
                <div
                  className={`text-[10px] mt-1.5 text-right font-medium ${
                    msg.sender === 'user'
                      ? 'text-emerald-200'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 border border-stone-200 dark:border-stone-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>Analyzing trip context & thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="mb-3 flex-shrink-0">
        <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Suggested Questions:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about your trip to ${destination || 'destination'}...`}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AITravelAssistant;
