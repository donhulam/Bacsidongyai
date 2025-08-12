import { GoogleGenAI, Chat, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error("Failed to read file as a data URL."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}


export function startChat(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
}

export async function* streamMessage(chat: Chat, message: string, file?: File) {
  const messageContent: (string | Part)[] = [message];
  if (file) {
      const filePart = await fileToGenerativePart(file);
      messageContent.push(filePart);
  }

  const result = await chat.sendMessageStream({ message: messageContent });

  for await (const chunk of result) {
    yield chunk.text;
  }
}