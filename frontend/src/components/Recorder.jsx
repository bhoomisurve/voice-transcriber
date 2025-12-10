import { useRef, useState } from "react";

export default function Recorder({ onAudioComplete, isProcessing }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    setError("");
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      // Create MediaRecorder with supported mime type
      let mimeType;
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else {
        mimeType = 'audio/ogg';
      }
      
      console.log("Using mime type:", mimeType);
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000 
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // When recording stops, create blob and send to backend
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log("Audio recorded - Size:", audioBlob.size, "bytes, Type:", mimeType);
        
        if (audioBlob.size > 100) {
          onAudioComplete(audioBlob);
        } else {
          setError("Recording too short or empty. Please speak for at least 2 seconds.");
        }
        
        // Stop all tracks to release microphone
        streamRef.current?.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      console.log("Recording started...");

    } catch (err) {
      console.error("Mic access error:", err);
      
      if (err.name === 'NotAllowedError') {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else if (err.name === 'NotFoundError') {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError("Failed to access microphone: " + err.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      // Request data before stopping
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.requestData();
      }
      mediaRecorderRef.current.stop();
      setRecording(false);
      console.log("Recording stopped");
    }
  };

  return (
    <div className="recorder-container">
      <button
        className={`mic-btn ${recording ? "recording" : ""}`}
        onClick={recording ? stopRecording : startRecording}
        disabled={isProcessing}
        title={recording ? "Click to stop recording" : "Click to start recording"}
      >
        <img src="/mic.svg" className="mic-icon" alt="Microphone" />
      </button>
      
      <p className="recorder-status">
        {isProcessing 
          ? "Processing..." 
          : recording 
          ? "🔴 Recording... (Click to stop)" 
          : "Click microphone to start recording"}
      </p>
      
      {error && (
        <div className="recorder-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}