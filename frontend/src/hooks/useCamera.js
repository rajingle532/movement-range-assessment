import { useRef, useState, useCallback, useEffect } from 'react';

export const useCamera = () => {
    const videoRef = useRef(null);
    const streamRef = useRef(null); // ← REAL stream reference, always accessible
    const [error, setError] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    // ── Nuclear stop: kills every track on the stored stream ──
    const stopVideo = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('🔴 Camera track stopped:', track.label);
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.load(); // flush the element
        }
        setIsCameraReady(false);
    }, []);

    const startVideo = useCallback(async () => {
        // Stop any existing stream first
        stopVideo();
        setError(null);

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Browser does not support camera access.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } }
            });

            streamRef.current = stream; // ← save to ref immediately

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setIsCameraReady(true);
                    console.log('✅ Camera started');
                };
            }
        } catch (err) {
            console.error('Camera Error:', err);
            if (err.name === 'NotAllowedError') setError('Camera Permission Denied.');
            else if (err.name === 'NotFoundError') setError('No camera found.');
            else setError(err.message || 'Could not access webcam.');
        }
    }, [stopVideo]);

    // ── Auto-cleanup when hook unmounts ──
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    return { videoRef, startVideo, stopVideo, error, isCameraReady };
};

