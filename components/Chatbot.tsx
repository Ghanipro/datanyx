
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Hello! I am your Legal Assistant. Ask me about SARFAESI Act, debt recovery laws, or company rights.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const client = getClient();
      if (!client) throw new Error("API Key missing");

      const prompt = `
        You are a specialized legal assistant for a Bank Recovery Officer.
        Rules:
        1. ONLY answer questions related to Indian Banking Laws, SARFAESI Act, Debt Recovery Tribunals (DRT), Insolvency and Bankruptcy Code (IBC), and Company Law.
        2. If the user asks about anything else (e.g., general knowledge, coding, jokes), politely refuse and state that you can only answer legal banking queries.
        3. Keep answers concise, professional, and actionable.

        User Question: ${userMsg}
      `;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I couldn't process that request." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the legal database right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50 transition-transform hover:scale-105 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <div className={`fixed bottom-6 right-6 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 origin-bottom-right transform ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold">Legal Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-slate-800 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                 {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
               </div>
               <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                 msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-600 rounded-tl-none'
               }`}>
                 {msg.text}
               </div>
            </div>
          ))}
          {loading && (
             <div className="flex items-start gap-2">
               <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                 <Bot className="w-5 h-5 text-purple-600" />
               </div>
               <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-600">
                 <div className="flex gap-1">
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-2">
          <input 
            type="text" 
            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-white"
            placeholder="Ask about banking laws..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
};
