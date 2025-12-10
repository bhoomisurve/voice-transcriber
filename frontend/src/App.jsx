import "./styles/main.css";
import { useState } from "react";
import Recorder from "./components/Recorder";

function App() {
  const [rawText, setRawText] = useState("");
  const [cleanedText, setCleanedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      // TRANSCRIBE
      console.log("Sending audio to backend...");
      const res = await fetch("http://127.0.0.1:8000/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Transcription failed: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Transcription received:", data);
      
      if (!data.transcript || data.transcript.trim() === "") {
        throw new Error("No speech detected. Please try speaking louder and closer to the microphone.");
      }
      
      setRawText(data.transcript);

      //  CLEAN TEXT
      const cleanRes = await fetch("http://127.0.0.1:8000/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.transcript }),
      });

      if (!cleanRes.ok) {
        throw new Error(`Cleaning failed: ${cleanRes.statusText}`);
      }

      const cleanData = await cleanRes.json();
      console.log("Cleaned text:", cleanData.cleaned);
      setCleanedText(cleanData.cleaned);
      
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred during processing");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="page">
      <h1 className="title"> AI Voice Transcriber</h1>

      <div className="main-card">
        <Recorder 
          onAudioComplete={sendAudioToBackend} 
          isProcessing={isProcessing}
        />

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Processing your audio...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
             {error}
          </div>
        )}

        <div className="divider" />

        <div className="panels">
          <div className="panel">
            <h2>Live Transcript</h2>
            <p>{rawText || "Start speaking… your words will appear here."}</p>
          </div>

          <div className="panel">
            <h2>AI Cleaned Transcript</h2>
            <p>{cleanedText || "AI improved text will show here."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;