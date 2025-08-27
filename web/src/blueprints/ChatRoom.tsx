import React, { useEffect, useState } from "react";

interface ChatProps {
  room: string;
}

interface WSMessage {
  latest_updated: string;
}

const Chat: React.FC<ChatProps> = ({ room }) => {
  const [msg, setMsg] = useState<string>("");
  const [recv, _] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:8000/ws/counts/${new Date().toISOString()}/`
    );

    ws.onmessage = (e: MessageEvent) => {
      const data: WSMessage = JSON.parse(e.data);
      console.log(data);
      // setRecv(data.message);
    };

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    setSocket(ws);

    return () => ws.close();
  }, [room]);

  const sendMsg = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload: WSMessage = { latest_updated: new Date().toISOString() };
      socket.send(JSON.stringify(payload));
      setMsg("");
    }
  };

  return (
    <div>
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type message"
      />
      <button onClick={sendMsg}>Send</button>
      <div>{recv}</div>
    </div>
  );
};

export default Chat;
