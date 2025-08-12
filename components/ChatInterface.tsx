
import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { startChat, streamMessage } from '../services/geminiService';
import { Role, Message } from '../types';
import ChatMessage from './ChatMessage';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';

const INITIAL_SUGGESTIONS = [
  "Làm thế nào để cải thiện giấc ngủ kém?",
  "Tôi thường bị đau mỏi vai gáy, có cách nào khắc phục không?",
  "Làm sao để giảm căng thẳng, lo âu bằng phương pháp Đông y?",
  "Chế độ ăn uống nào tốt cho người hay bị đầy hơi, khó tiêu?",
  "Tôi hay bị lạnh tay chân, đó là dấu hiệu của bệnh gì?",
  "Có bài tập khí công nào đơn giản cho người mới bắt đầu không?",
  "Làm thế nào để tăng cường sức đề kháng theo Y học cổ truyền?",
  "Da tôi bị khô và hay nổi mụn, Đông y có lời khuyên gì không?",
  "Tư vấn giúp tôi cách giải độc gan tự nhiên.",
  "Tôi nên làm gì khi cơ thể luôn cảm thấy mệt mỏi, uể oải?"
];

const ChatInterface: React.FC = () => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // This logic runs on mount/remount
    setIsLoading(true);
    try {
        const session = startChat();
        setChatSession(session);
        setMessages([
            {
              role: Role.MODEL,
              content: "Xin chào! Tôi là Bác Sĩ Đông Y AI. Bạn có thể mô tả triệu chứng của mình, đính kèm tệp nếu cần, hoặc chọn một trong các câu hỏi gợi ý bên dưới để bắt đầu nhé.",
            },
        ]);
        setError(null);
        
        const shuffled = [...INITIAL_SUGGESTIONS].sort(() => 0.5 - Math.random());
        setActiveSuggestions(shuffled.slice(0, 5));
    } catch (e) {
        if (e instanceof Error) {
            setError(`Không thể khởi tạo chatbot: ${e.message}. Vui lòng kiểm tra API Key.`);
        } else {
            setError("Đã xảy ra lỗi không xác định.");
        }
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activeSuggestions]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const submitMessage = async (messageText: string, file?: File | null) => {
    if ((!messageText.trim() && !file) || isLoading || !chatSession) return;

    setError(null);
    setIsLoading(true);
    setActiveSuggestions([]);

    const newUserMessage: Message = { 
        role: Role.USER,
        content: messageText,
        file: file ? { name: file.name, type: file.type } : undefined
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setMessages((prevMessages) => [...prevMessages, { role: Role.MODEL, content: '' }]);

    try {
      let fullResponse = '';
      const stream = streamMessage(chatSession, messageText, file || undefined);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if(lastMessage) {
            const contentWithoutSuggestions = fullResponse.replace(/<SUGGESTIONS>[\s\S]*<\/(SUGGESTIONS|SUGENSIONS)>/i, '').trim();
            lastMessage.content = contentWithoutSuggestions;
          }
          return newMessages;
        });
      }
      
      const suggestionRegex = /<SUGGESTIONS>([\s\S]*)<\/(?:SUGGESTIONS|SUGENSIONS)>/i;
      const match = fullResponse.match(suggestionRegex);
      let finalContent = fullResponse.replace(suggestionRegex, '').trim();
      let parsedSuggestions: string[] = [];

      if (match && match[1]) {
        try {
          // Attempt to clean up common JSON errors before parsing
          const cleanedJsonString = match[1].trim().replace(/,(\s*\])$/, '$1');
          parsedSuggestions = JSON.parse(cleanedJsonString);
        } catch (e) {
          console.error("Failed to parse suggestions JSON:", e);
          // Don't show suggestions if parsing fails
          parsedSuggestions = [];
        }
      }

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage) {
          lastMessage.content = finalContent;
        }
        return newMessages;
      });
      
      setActiveSuggestions(parsedSuggestions.slice(0, 5));

    } catch (e) {
      const errorMessage = "Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.";
      setError(errorMessage);
       setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage) {
             lastMessage.content = errorMessage;
          }
          return newMessages;
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // You can add file size validation here
        setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = userInput;
    const fileToSend = selectedFile;
    if (!messageToSend.trim() && !fileToSend) return;
    
    setUserInput('');
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";

    submitMessage(messageToSend, fileToSend);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleFormSubmit(e as any);
    }
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col bg-white rounded-2xl shadow-2xl shadow-teal-100/50 border border-gray-200">
      <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            message={msg}
            isLoading={isLoading && index === messages.length - 1} 
          />
        ))}

        {!isLoading && activeSuggestions.length > 0 && (
          <div className="pt-4 pb-2 pl-16">
            <div className="flex flex-wrap items-center gap-2">
              {activeSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => submitMessage(suggestion)}
                  className="px-3 py-1.5 text-sm font-medium text-teal-800 bg-teal-100 rounded-full hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ease-in-out"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
         {error && <div className="text-red-500 text-center p-2">{error}</div>}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        {selectedFile && (
            <div className="mx-12 mb-2 px-3 py-2 bg-gray-100 rounded-lg flex justify-between items-center text-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-2 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    <span className="text-gray-700 font-medium truncate">{selectedFile.name}</span>
                </div>
                <button onClick={removeSelectedFile} className="text-gray-500 hover:text-red-600 font-bold text-lg p-1">&times;</button>
            </div>
        )}
        <form onSubmit={handleFormSubmit} className="flex items-end gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !chatSession}
            className="p-3 rounded-full text-gray-500 disabled:text-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors flex-shrink-0"
            aria-label="Đính kèm tệp"
          >
            <PaperclipIcon />
          </button>
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập triệu chứng hoặc câu hỏi..."
            className="flex-grow p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none max-h-32"
            rows={1}
            disabled={isLoading || !chatSession}
          />
          <button
            type="submit"
            disabled={isLoading || (!userInput.trim() && !selectedFile) || !chatSession}
            className="p-3 rounded-full bg-teal-600 text-white disabled:bg-gray-400 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors flex-shrink-0"
            aria-label="Gửi tin nhắn"
          >
            <SendIcon />
          </button>
        </form>
         <p className="text-xs text-gray-500 text-center mt-3 px-4">
            Lưu ý: Tư vấn của AI chỉ mang tính chất tham khảo, không thay thế cho chẩn đoán và chỉ định của bác sĩ chuyên khoa.
        </p>
        <p className="text-xs text-gray-500 text-center mt-1 px-4">
            Phiên bản thử nghiệm Beta, dùng để nghiên cứu về AI
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;