import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! I am Suvidha AI, your digital village assistant. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    'How do I file a complaint?',
    'What schemes can I apply for?',
    'How does complaint tracking work?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let botResponse = '';
      const query = text.toLowerCase();

      if (query.includes('complaint') || query.includes('file') || query.includes('report')) {
        botResponse = 'To file a complaint: \n1. Log in or Register a citizen account.\n2. Click "Report a Complaint" in the menu or sidebar.\n3. Fill in the title, description, category, and pin location.\n4. Upload a photo of the issue for verification.\nOur Panchayat admins will verify it and assign a field worker within 24 hours.';
      } else if (query.includes('scheme') || query.includes('yojana') || query.includes('apply')) {
        botResponse = 'You can browse active rural development schemes under the "Schemes" section. We support various programs including Jal Jeevan Mission, Pradhan Mantri Awas Yojana, and local infrastructure projects. You can apply directly through the schemes dashboard.';
      } else if (query.includes('track') || query.includes('status') || query.includes('progress')) {
        botResponse = 'Once you file a complaint, it is updated dynamically. Go to your dashboard to view its status:\n- Pending: Under review by Panchayat admin\n- Assigned: Field agent is dispatched\n- Resolved: Issue rectified with completion proof uploaded.';
      } else if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('namaste')) {
        botResponse = 'Hello! I can guide you on registering complaints, checking scheme eligibility, and tracking civic issues. What would you like to know?';
      } else {
        botResponse = 'I apologize, I am still learning. You can easily file a complaint, track civic issues, or apply for schemes using the navigation bar. Let me know if you need assistance with registration!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#0F4B70] text-[#C4F8FF] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0F4B70]/80 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-[#C4F8FF]/30"
          title="Open Suvidha AI Assistant"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-[#061926]/95 backdrop-blur-xl rounded-2xl border border-[#C4F8FF]/20 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="bg-[#0F4B70]/80 backdrop-blur-md text-[#C4F8FF] p-4 flex items-center justify-between border-b border-[#C4F8FF]/20 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#C4F8FF]/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-[#C4F8FF]/20">
                <Bot size={20} className="text-[#C4F8FF]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Suvidha AI <Sparkles size={13} className="text-[#C4F8FF] animate-pulse" />
                </h3>
                <span className="text-[10px] text-[#C4F8FF]/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#C4F8FF] rounded-full animate-ping"></span>
                  Online Assistant
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#C4F8FF]/60 hover:text-[#C4F8FF] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-[#C4F8FF] text-[#0F4B70]'
                      : 'bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/20'
                  }`}
                >
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Message Bubble */}
                <div className="max-w-[75%]">
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#0F4B70] text-[#C4F8FF] rounded-tr-none border border-[#C4F8FF]/20'
                        : 'bg-[#0F4B70]/40 text-[#C4F8FF] border border-[#C4F8FF]/15 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span
                    className={`text-[9px] text-[#C4F8FF]/50 mt-1 block ${
                      msg.sender === 'user' ? 'text-right' : ''
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-[#0F4B70]/40 border border-[#C4F8FF]/15 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#C4F8FF]/60 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#C4F8FF]/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#C4F8FF]/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-[#0F4B70]/20 border-t border-[#C4F8FF]/15 flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="text-[10px] bg-[#0F4B70]/40 hover:bg-[#0F4B70] text-[#C4F8FF]/80 hover:text-[#C4F8FF] border border-[#C4F8FF]/20 rounded-full px-2.5 py-1.5 transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="p-3 border-t border-[#C4F8FF]/20 bg-[#0F4B70]/40 backdrop-blur-md flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Suvidha AI..."
              className="flex-1 text-xs border border-[#C4F8FF]/20 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 bg-[#0F4B70] disabled:opacity-40 text-[#C4F8FF] border border-[#C4F8FF]/30 rounded-xl flex items-center justify-center hover:bg-[#0F4B70]/80 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
