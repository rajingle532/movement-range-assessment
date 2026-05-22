import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url) => {
    const [isConnected, setIsConnected] = useState(false);
    const [angles, setAngles] = useState({ elbow: 0, knee: 0, shoulder: 0 });
    const [status, setStatus] = useState({});
    const [annotatedFrame, setAnnotatedFrame] = useState(null);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const isMountedRef = useRef(true); // ✅ track if component is mounted

    const connect = useCallback(() => {
        if (!isMountedRef.current) return; // ✅ Don't reconnect after unmount
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
            if (!isMountedRef.current) return;
            setIsConnected(true);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };

        socketRef.current.onmessage = (event) => {
            if (!isMountedRef.current) return;
            try {
                const data = JSON.parse(event.data);
                if (data.angles) setAngles(data.angles);
                if (data.status) setStatus(data.status);
                if (data.annotated_frame) setAnnotatedFrame(data.annotated_frame);
            } catch (err) {}
        };

        socketRef.current.onclose = () => {
            if (!isMountedRef.current) return; // ✅ Don't reconnect if unmounted
            setIsConnected(false);
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        socketRef.current.onerror = (err) => {
            if (socketRef.current) socketRef.current.close();
        };
    }, [url]);

    useEffect(() => {
        isMountedRef.current = true;
        connect();
        return () => {
            isMountedRef.current = false; // ✅ Mark as unmounted first
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (socketRef.current) {
                socketRef.current.onclose = null; // ✅ Prevent onclose firing reconnect
                socketRef.current.close();
            }
        };
    }, [connect]);

    const sendFrame = useCallback((base64Frame) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ frame: base64Frame }));
        }
    }, []);

    return { isConnected, angles, status, annotatedFrame, sendFrame };
};
