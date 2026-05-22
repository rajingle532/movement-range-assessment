import { useRef, useState, useCallback } from 'react';

export const useCamera = () => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const startVideo = useCallback(async () => {
        setError(null);
        setIsCameraReady(false);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser does not support camera access.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    frameRate: { ideal: 15 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setIsCameraReady(true);
                    console.log("Camera Stream Started ✅");
                };
            }
        } catch (err) {
            console.error("Camera Error:", err);
            if (err.name === 'NotAllowedError') {
                setError("Camera Permission Denied. Please enable it in browser settings.");
            } else if (err.name === 'NotFoundError') {
                setError("No camera found on this device.");
            } else {
                setError(err.message || "Could not access webcam.");
            }
        }
    }, []);

    const stopVideo = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraReady(false);
        }
    }, []);

    return { videoRef, startVideo, stopVideo, error, isCameraReady };
};
