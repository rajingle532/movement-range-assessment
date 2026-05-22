import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url) => {
    const [isConnected, setIsConnected] = useState(false);
    const [angles, setAngles] = useState({ elbow: 0, knee: 0, shoulder: 0 });
    const [status, setStatus] = useState({});
    const [annotatedFrame, setAnnotatedFrame] = useState(null);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        console.log("Attempting to connect to WebSocket...");
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
            console.log("WebSocket Connected ✅");
            setIsConnected(true);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };

        socketRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.angles) setAngles(data.angles);
                if (data.status) setStatus(data.status);
                if (data.annotated_frame) setAnnotatedFrame(data.annotated_frame);
            } catch (err) {
                console.error("Error parsing WebSocket message:", err);
            }
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket Disconnected ❌. Reconnecting in 3s...");
            setIsConnected(false);
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        socketRef.current.onerror = (err) => {
            console.error("WebSocket Error:", err);
            socketRef.current.close();
        };
    }, [url]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) socketRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [connect]);

    const sendFrame = useCallback((base64Frame) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ frame: base64Frame }));
        }
    }, []);

    return { isConnected, angles, status, annotatedFrame, sendFrame };
};
