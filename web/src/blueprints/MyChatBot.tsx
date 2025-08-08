import React, { useEffect, useState, useRef } from "react";
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
} from "./MySpeechRecognition";
import { guidedRequest } from "./MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../constants/constants";

type Message = {
  text: string;
  sender: "user" | "bot";
};

export const MyChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Init SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported.");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("")
        .toLowerCase();

      console.log("Heard:", transcript);

      if (transcript.includes("hey chat") && !listening) {
        toggleListening(); // start listening
      }
      if (transcript.includes("roger")) {
        sendMessage();
        recognition.stop();
      }
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    const fetchModel = async () => {
      const res = await guidedRequest<{ data: { id: string }[] }>(
        "v1/models",
        { method: "GET" },
        BASE_URL,
        "http://localhost:5000",
        true
      );

      if (res.ok && res.data) {
        const llm = res.data.data.find(
          (m) => !m.id.includes("embed") && !m.id.includes("embedding")
        );
        if (llm) setSelectedModel(llm.id);
        else addMessage("No chat LLM model found.", "bot");
      }
    };
    fetchModel();
  }, []);

  const addMessage = (text: string, sender: "user" | "bot") => {
    setMessages((msgs) => [...msgs, { text, sender }]);
    if (sender === "bot") speakText(text);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedModel) return;

    addMessage(input, "user");
    setInput("");
    addMessage("Bot is typing...", "bot");

    try {
      const res = await guidedRequest<{
        choices: { message: { content: string } }[];
      }>(
        "v1/chat/completions",
        {
          method: "POST",
          body: {
            model: selectedModel,
            messages: [{ role: "user", content: input }],
            temperature: 0.7,
            max_tokens: 512,
          },
        },
        BASE_URL,
        "http://localhost:5000",
        true
      );

      const reply =
        res.ok && res.data
          ? res.data.choices[0].message.content
          : "Error: Could not get response.";

      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { text: reply, sender: "bot" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { text: "Error connecting to LM Studio.", sender: "bot" },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl max-w-[80%] ${
              msg.sender === "user"
                ? "bg-green-100 self-end"
                : "bg-yellow-100 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say something..."
          className="flex-1 p-3 border rounded"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
        <button
          onClick={toggleListening}
          className={`ml-2 px-4 py-2 rounded ${
            listening ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {listening ? "Stop Mic" : "🎙 Start"}
        </button>
      </div>
    </div>
  );
};
