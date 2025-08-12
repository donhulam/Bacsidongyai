
import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ResetIcon from './components/icons/ResetIcon';
import InfoIcon from './components/icons/InfoIcon';
import InfoModal from './components/InfoModal';

function App() {
  const [chatKey, setChatKey] = useState(Date.now());
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleResetChat = () => {
    setChatKey(Date.now());
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 flex flex-col h-screen">
        <header className="relative py-4 border-b border-gray-200 mb-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-teal-800">
              Bác Sĩ Đông Y AI
            </h1>
            <p className="text-md text-gray-600 mt-1">
              Trợ lý sức khỏe ứng dụng Y học cổ truyền
            </p>
          </div>
          <div className="absolute bottom-2 left-0">
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-3 rounded-full text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              aria-label="Giới thiệu và Hướng dẫn"
              title="Giới thiệu và Hướng dẫn"
            >
              <InfoIcon />
            </button>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2">
            <button
              onClick={handleResetChat}
              className="p-3 rounded-full text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              aria-label="Nhiệm vụ mới"
              title="Nhiệm vụ mới"
            >
              <ResetIcon />
            </button>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center min-h-0">
          <ChatInterface key={chatKey} />
        </main>
      </div>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </div>
  );
}

export default App;