import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { post, get } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, text: 'Xin chào! Tôi là trợ lý ảo TravelNow. Tôi có thể giúp gì cho bạn?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Làm sao để đặt phòng?",
    "Chính sách hủy phòng",
    "Khuyến mãi hiện có",
    "Liên hệ hỗ trợ"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      console.log('Fetching chat history for user:', user.email);
      const fetchHistory = async () => {
        try {
          const history = await get('/chat/history');
          console.log('History fetched:', history);
          if (history && history.length > 0) {
            const formattedHistory = history.map(msg => ({
              id: msg._id,
              text: msg.message,
              sender: msg.sender
            }));
            setMessages(formattedHistory);
          }
        } catch (error) {
          console.error('Failed to fetch chat history:', error);
        }
      };
      fetchHistory();
    }
  }, [isOpen, user]);

  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call API
      const response = await post('/chat', { message: userMessage.text });
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.reply || 'Xin lỗi, tôi đang gặp sự cố kết nối.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <div className="group fixed bottom-6 right-6 z-50 flex items-center justify-end">
          <div className="mr-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-slate-700 whitespace-nowrap border border-slate-100">
            Tôi là chatbot, tôi có thể hỗ trợ được bạn
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <img 
              src="/chatbot.png" 
              alt="Chatbot" 
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white border-2 border-white/20">
                <img src="/chatbot.png" alt="Bot" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold">TravelNow Support</h3>
                <p className="text-[10px] text-white/80">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex max-w-[85%] ${
                    msg.sender === 'user' ? 'self-end' : 'self-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-slate-700 shadow-sm rounded-bl-none border border-slate-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex self-start max-w-[85%]">
                  <div className="rounded-2xl rounded-bl-none bg-white px-4 py-3 shadow-sm border border-slate-100">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Suggested Questions */}
              {messages.length < 3 && !isLoading && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(null, question)}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 hover:border-primary/30"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-100 bg-white p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:bg-slate-300"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
