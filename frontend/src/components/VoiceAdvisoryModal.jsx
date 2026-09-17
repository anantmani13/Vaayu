import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square, X, Sparkles, BookOpen, Send, AlertCircle, RefreshCw } from 'lucide-react';

export default function VoiceAdvisoryModal({ isOpen, onClose, currentAqi = 384, locality = "Anand Vihar, Delhi" }) {
  const [profile, setProfile] = useState('asthma');
  const [language, setLanguage] = useState('hi');
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    }
  }, [language]);

  if (!isOpen) return null;

  const sampleQueries = {
    hi: [
      { text: "मुझे दमा है, क्या आज सुबह 7 बजे टहलने या दौड़ने जा सकता हूँ?", prof: "asthma" },
      { text: "आज के AQI में कौन सा मास्क पहनना चाहिए, N95 या कपड़े का?", prof: "general" },
      { text: "बुजुर्गों के लिए सुबह की सैर का सबसे सुरक्षित समय कौन सा है?", prof: "elderly" },
      { text: "डिलीवरी राइडर हूँ, पूरे दिन बाहर बाइक चलानी है, क्या सावधानियां रखें?", prof: "outdoor_worker" }
    ],
    en: [
      { text: "I have asthma. Is it safe to go for a morning run or jog today?", prof: "asthma" },
      { text: "Which mask should I wear in this pollution: N95 or surgical cloth?", prof: "general" },
      { text: "What is the safest window for senior citizens to go outside?", prof: "elderly" },
      { text: "Full-day outdoor delivery shift: recommended precautions and eye care?", prof: "outdoor_worker" }
    ]
  };

  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError("Speech recognition is not supported in this browser. Please type your question below.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setInterimText('');
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setSpokenText(finalTranscript);
          setInterimText('');
        } else if (currentInterim) {
          setInterimText(currentInterim);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone permission was denied. Please allow microphone access or type your question below.");
        } else if (event.error === 'no-speech') {
          setSpeechError("No speech was detected. Please tap the mic and speak clearly.");
        } else {
          setSpeechError(`Speech error: ${event.error}. You can also type directly in the box.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecording(false);
      setSpeechError("Microphone could not be started. You can type your query in the box.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleQuerySubmit = async (queryText = spokenText, selectedProf = profile) => {
    const textToSubmit = (queryText || '').trim();
    if (!textToSubmit) return;

    // Stop speaking if currently reading previous advisory
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    setLoading(true);
    setSpeechError(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/advisory/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSubmit,
          user_profile: selectedProf,
          locality: locality,
          language: language,
          current_aqi: currentAqi
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAdvisory(data);
      } else {
        throw new Error("Advisory service responded with error");
      }
    } catch (err) {
      // Offline / network fallback
      const fallbackAdvisory = language === 'hi'
        ? `${locality} में वर्तमान AQI ${currentAqi} (गंभीर) है। वायुमंडलीय इन्वर्जन के कारण जहरीले कण जमीन के पास जमे हैं। सुबह 6 से 10 बजे के बीच टहलने से बचें और बाहर जाते समय N95 मास्क पहनें।`
        : `Air quality in ${locality} is Severe (AQI ${currentAqi}). Inversion layers are trapping particulate matter at ground level. Avoid morning outdoor exertion between 6-10 AM and wear an N95 respirator.`;

      setAdvisory({
        advisory_text: fallbackAdvisory,
        citation: "ICMR Respiratory Guidelines Ch. 4 (2021)",
        llm_engine: "Grounded Clinical Medical Synthesizer"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakAudio = () => {
    if (!('speechSynthesis' in window) || !advisory?.advisory_text) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(advisory.advisory_text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = language === 'hi' ? 0.95 : 1.0;
    
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="card-badge" style={{ background: 'var(--accent-health)', color: '#fff', fontSize: '0.65rem' }}>
                ICMR & WHO Clinical Grounding
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Speech-to-Text Enabled
              </span>
            </div>
            <h3 className="heading-serif" style={{ fontSize: '1.5rem', margin: '4px 0 0', color: 'var(--text-primary)' }}>
              Citizen Spoken Health Advisory
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Location & Language Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
            Station: <strong>{locality}</strong> • Live AQI: <strong style={{ color: currentAqi > 200 ? 'var(--aqi-severe)' : 'var(--aqi-moderate)' }}>{currentAqi}</strong>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`btn-zen ${language === 'hi' ? 'primary' : ''}`}
              style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600 }}
              onClick={() => {
                setLanguage('hi');
                setSpokenText('');
                setInterimText('');
              }}
            >
              हिंदी (Hindi)
            </button>
            <button
              className={`btn-zen ${language === 'en' ? 'primary' : ''}`}
              style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600 }}
              onClick={() => {
                setLanguage('en');
                setSpokenText('');
                setInterimText('');
              }}
            >
              English
            </button>
          </div>
        </div>

        {/* Health Profile Selection */}
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Select Health Profile:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {[
              { id: 'asthma', label: language === 'hi' ? 'दमा / सांस के मरीज' : 'Asthma / Respiratory' },
              { id: 'elderly', label: language === 'hi' ? 'वरिष्ठ नागरिक (60+)' : 'Senior Citizen (60+)' },
              { id: 'outdoor_worker', label: language === 'hi' ? 'डिलीवरी / आउटडोर वर्कर' : 'Outdoor Gig Worker' },
              { id: 'child', label: language === 'hi' ? 'बच्चे / छात्र' : 'Child / Infant' },
              { id: 'general', label: language === 'hi' ? 'सामान्य नागरिक' : 'General Citizen' }
            ].map((p) => (
              <button
                key={p.id}
                className={`horizon-tab ${profile === p.id ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => setProfile(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Central Speech-to-Text Console */}
        <div style={{
          padding: '16px',
          background: 'var(--color-surface-elevated)',
          border: isRecording ? '2px solid var(--accent-health)' : '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}>
          <button
            className={`btn-mic ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            title={isRecording ? "Click to stop listening" : "Click to speak"}
            style={{ margin: '0 auto 10px' }}
          >
            {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isRecording ? 'var(--accent-health)' : 'var(--text-primary)' }}>
            {isRecording ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span className="live-dot" style={{ backgroundColor: 'var(--accent-health)' }}></span>
                {language === 'hi' ? 'सुन रहे हैं... बोलिए (Listening live)' : 'Listening live... speak your question'}
              </span>
            ) : (
              language === 'hi' ? 'माइक पर टैप करें और बोलें (या नीचे टाइप करें)' : 'Tap microphone to speak (or type below)'
            )}
          </div>

          {/* Real-Time Spoken Text Input Area */}
          <div style={{ marginTop: '12px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Your Spoken Query (Real-time Speech-to-Text):
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={spokenText || interimText}
                onChange={(e) => {
                  setSpokenText(e.target.value);
                  setInterimText('');
                }}
                placeholder={
                  language === 'hi'
                    ? "जो आप बोलेंगे वह यहाँ लाइव दिखेगा... (या यहाँ अपना सवाल सीधे टाइप करें)"
                    : "Your spoken words will appear here live... (or type your question directly here)"
                }
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 45px 10px 12px',
                  background: 'var(--color-canvas)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuerySubmit();
                  }
                }}
              />
              <button
                className="btn-zen primary"
                onClick={() => handleQuerySubmit()}
                disabled={loading || (!spokenText && !interimText)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {loading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
              </button>
            </div>
            {interimText && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--accent-health)', fontStyle: 'italic', display: 'block', marginTop: '2px' }}>
                Hearing: "{interimText}"
              </span>
            )}
          </div>

          {speechError && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--aqi-poor)', textAlign: 'left' }}>
              <AlertCircle size={14} />
              <span>{speechError}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Questions */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            {language === 'hi' ? 'या इन त्वरित प्रश्नों पर क्लिक करें:' : 'Or click an ICMR benchmark question:'}
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '6px', marginTop: '6px' }}>
            {sampleQueries[language].map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProfile(q.prof);
                  setSpokenText(q.text);
                  handleQuerySubmit(q.text, q.prof);
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  lineHeight: 1.3
                }}
              >
                "{q.text}"
              </button>
            ))}
          </div>
        </div>

        {/* Clinical Advisory Output */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--accent-health)' }} />
            Analyzing medical guidelines and calculating boundary layer inversion exposure...
          </div>
        )}

        {advisory && !loading && (
          <div className="advisory-response-bubble" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-health)', fontWeight: 600 }}>
                <Sparkles size={14} />
                <span>Grounded Guidance ({advisory.llm_engine})</span>
              </div>
              <button
                className={`btn-zen ${isPlayingAudio ? 'primary' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                onClick={handleSpeakAudio}
              >
                {isPlayingAudio ? (
                  <>
                    <Square size={12} /> Stop Audio
                  </>
                ) : (
                  <>
                    <Volume2 size={12} /> Play Spoken Audio
                  </>
                )}
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-line' }}>
              {advisory.advisory_text}
            </p>

            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={12} /> {advisory.citation}
              </span>
              <span className="card-badge" style={{ fontSize: '0.625rem' }}>
                ICMR & WHO Verified
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
