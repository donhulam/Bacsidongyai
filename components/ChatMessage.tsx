import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { Role, Message, FileInfo } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import DownloadIcon from './icons/DownloadIcon';

interface FormattedContentProps {
  text: string;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ text }) => {
  const processLine = (line: string, lineKey: string | number) => {
    return line.split('**').map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={`${lineKey}-strong-${index}`}>{part}</strong>;
      }
      return part;
    });
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const endList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside my-2 ml-4 space-y-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('- ')) {
      currentList.push(
        <li key={`li-${index}`}>{processLine(trimmedLine.substring(2), index)}</li>
      );
    } else {
      endList();
      if (trimmedLine.length > 0) {
         elements.push(
          <p key={`p-${index}`} className="my-1">
            {processLine(line, index)}
          </p>
        );
      }
    }
  });

  endList();

  return <>{elements}</>;
};

const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

const FileChip: React.FC<{ file: FileInfo }> = ({ file }) => {
    return (
        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-200 px-3 py-1.5 text-sm font-medium text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <span className="truncate max-w-xs">{file.name}</span>
        </div>
    );
};

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isModel = message.role === Role.MODEL;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Không thể sao chép nội dung: ', err);
    });
  };

  const handleDownloadDocx = () => {
    if (!message.content) return;

    const createDocxParagraphs = (text: string): Paragraph[] => {
        const docxParagraphs: Paragraph[] = [];
        const lines = text.split('\n');
    
        const processLineForTextRuns = (lineContent: string): TextRun[] => {
            return lineContent.split('**').map((part, index) => new TextRun({
                text: part,
                bold: index % 2 === 1,
                font: "Calibri",
                size: 24, // 12pt
            }));
        };
    
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- ')) {
                docxParagraphs.push(new Paragraph({
                    children: processLineForTextRuns(trimmedLine.substring(2)),
                    bullet: { level: 0 },
                }));
            } else if (trimmedLine.length > 0) {
                 if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                     docxParagraphs.push(new Paragraph({
                        children: [new TextRun({
                            text: trimmedLine.substring(2, trimmedLine.length - 2),
                            bold: true,
                            size: 28, // 14pt
                        })],
                        spacing: { after: 200 }
                    }));
                 } else {
                     docxParagraphs.push(new Paragraph({ children: processLineForTextRuns(trimmedLine) }));
                 }
            }
        });
        return docxParagraphs;
    };

    const doc = new Document({
        sections: [{
            children: createDocxParagraphs(message.content),
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const firstLine = message.content.split('\n')[0].replace(/\*/g, '').substring(0, 30) || 'tu-van';
        const filename = `Tu-van-Dong-y-${firstLine.replace(/ /g, '-')}.docx`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
  };

  const showActionButtons = isModel && !isLoading && message.content.trim().length > 0;

  return (
    <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isModel ? 'bg-teal-600' : 'bg-blue-500'}`}>
        {isModel ? <BotIcon /> : <UserIcon />}
      </div>
      <div className={`max-w-xl p-4 rounded-xl shadow-md ${isModel ? 'bg-white text-gray-800 rounded-tl-none' : 'bg-blue-100 text-gray-800 rounded-tr-none'}`}>
         {isLoading && message.content === '' && !message.file ? (
            <TypingIndicator />
         ) : (
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2">
                {message.content && <FormattedContent text={message.content} />}
                {!isModel && message.file && <FileChip file={message.file} />}
            </div>
         )}
        {showActionButtons && (
            <div className="mt-3 border-t pt-2 flex justify-end items-center gap-2">
                <button
                    onClick={handleDownloadDocx}
                    className="flex items-center gap-1.5 text-xs font-medium rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Tải xuống dưới dạng tệp .docx"
                >
                    <DownloadIcon />
                </button>
                 <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-xs font-medium rounded-md px-2 py-1 transition-colors ${
                        isCopied
                        ? 'text-green-700 bg-green-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    disabled={isCopied}
                    title="Sao chép nội dung"
                >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    {isCopied ? 'Đã sao chép' : 'Sao chép'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;