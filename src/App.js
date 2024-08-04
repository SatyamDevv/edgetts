import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import language_dict from "./components/VoiceLanguage";

const TextToAudioComponent = () => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedVoice, setSelectedVoice] = useState('Guy');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef(new Audio());

  const generateVoice = async () => {
    setIsGenerating(true);
    try {
      const voice = language_dict[selectedLanguage][selectedVoice];
      const response = await axios.post(
        'https://script2audio-flask.onrender.com/tts',
        { text, voice },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setAudioUrl(url);
      audioRef.current.src = url;
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
    } catch (error) {
      console.error('Error generating voice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    audioRef.current.currentTime = time;
  };

  const updateProgress = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'generated_audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#f0f4f8',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#2c3e50', textAlign: 'center' }}>Text to Audio Converter</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#34495e', fontWeight: 'bold' }}>Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to audio"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '16px', resize: 'vertical', minHeight: '100px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#34495e', fontWeight: 'bold' }}>Language</label>
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '16px', backgroundColor: 'white' }}
          >
            {Object.keys(language_dict).map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#34495e', fontWeight: 'bold' }}>Voice</label>
          <select 
            value={selectedVoice} 
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '16px', backgroundColor: 'white' }}
          >
            {Object.keys(language_dict[selectedLanguage]).map((voice) => (
              <option key={voice} value={voice}>{voice}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={generateVoice}
          disabled={isGenerating}
          style={{ 
            width: '100%', 
            padding: '14px', 
            backgroundColor: isGenerating ? '#bdc3c7' : '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: isGenerating ? 'not-allowed' : 'pointer', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            transition: 'background-color 0.3s' 
          }}
        >
          {isGenerating ? 'Generating Audio...' : 'Generate Audio'}
        </button>
        {isGenerating && (
          <p style={{ color: '#e74c3c', textAlign: 'center', marginTop: '10px' }}>
            If our server is busy/off, it may take up to 50 seconds to generate the voice for the first time.
          </p>
        )}
        {audioUrl && (
          <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            {/* <p style={{ color: '#27ae60', marginBottom: '15px', fontWeight: 'bold' }}>New audio generated!</p> */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <button 
                onClick={handlePlay}
                style={{ padding: '10px 20px', backgroundColor: isPlaying ? '#e74c3c' : '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'background-color 0.3s' }}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button 
                onClick={handleDownload}
                style={{ padding: '10px 20px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'background-color 0.3s' }}
              >
                Download
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              style={{ width: '100%', marginBottom: '10px', accentColor: '#3498db' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#7f8c8d' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToAudioComponent;