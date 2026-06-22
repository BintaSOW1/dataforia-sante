import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { envoyerMessage } from '../services/api';

const WOLOF_STT_URL = 'https://wolof-service-production.up.railway.app/stt';
const WOLOF_TTS_URL = 'https://wolof-service-production.up.railway.app/tts';

export default function DatoBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis DatoBot, votre assistant santé DataforiaSanté\n\nJe parle Français, Anglais et Wolof 🇸🇳\n\nComment puis-je vous aider ?',
      suggestions: ['Je veux voir un médecin', 'Téléconsultation vidéo', 'Pharmacie près de moi', 'Hôpital disponible'],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState('fr-FR');
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceModeRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  function nettoyerTexte(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{1F000}-\u{1F02F}]/gu, '')
      .replace(/[\u{1F100}-\u{1F1FF}]/gu, '')
      .replace(/[#*_\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = nettoyerTexte(text);
    if (!clean || clean.length < 5) return;
    setTimeout(() => {
      const utt = new SpeechSynthesisUtterance(clean);
      utt.lang = 'fr-FR';
      utt.rate = 0.93;
      utt.pitch = 1.0;
      utt.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frVoice) utt.voice = frVoice;
      utt.onerror = (e) => console.error('TTS error:', e);
      window.speechSynthesis.speak(utt);
    }, 100);
  }

  async function speakTextWolof(text) {
    if (voiceLang !== 'wo') {
      speakText(text);
      return;
    }
    try {
      const response = await fetch(WOLOF_TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: nettoyerTexte(text), langue: 'fr' })
      });
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('Erreur TTS wolof:', err);
      speakText(text);
    }
  }

  async function envoyerFeedback(messageUser, reponseBot, feedback, correction = null) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_utilisateur: messageUser,
          reponse_datobot: reponseBot,
          reponse_corrigee: correction,
          feedback,
          session_id: sessionId
        })
      });
      console.log(`✅ Feedback ${feedback} sauvegardé`);
    } catch (err) {
      console.error('Erreur feedback:', err);
    }
  }

  async function enregistrerCorrectionVocale(messageUser, reponseBot) {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: mimeType });
        const formData = new FormData();
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        formData.append('audio', blob, `correction.${ext}`);
        try {
          const response = await fetch(WOLOF_STT_URL, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          if (data.success && data.texte) {
            await envoyerFeedback(messageUser, reponseBot, 'mauvais', data.texte);
            alert(`✅ Correction sauvegardée : "${data.texte}"`);
          }
        } catch (err) {
          console.error('Erreur correction vocale:', err);
        }
      };

      mediaRecorder.start(100);
      setTimeout(() => mediaRecorder.stop(), 5000);
    } catch (err) {
      setIsRecording(false);
      console.error('Erreur micro:', err);
    }
  }

  async function obtenirLocalisation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Géolocalisation non supportée');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => reject(error),
        { timeout: 10000 }
      );
    });
  }

  async function envoyer(texte) {
    const msg = texte || input.trim();
    if (!msg || loading) return;
    setInput('');
    voiceModeRef.current = false;

    // Obtenir localisation si pas encore fait
    let location = userLocation;
    if (!location) {
      try {
        location = await obtenirLocalisation();
      } catch (err) {
        console.log('Localisation non disponible');
      }
    }

    const userMsg = {
      role: 'user',
      content: msg,
      suggestions: [],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await envoyerMessage(msg, sessionId, location);
      const { reply, suggestions } = res.data.data;
      const botMsg = {
        role: 'assistant',
        content: reply,
        suggestions: suggestions || [],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => speakTextWolof(reply), 500);
    } catch (err) {
      const errMsg = voiceLang === 'en-US'
        ? 'Sorry, technical issue. Please try again.'
        : 'Désolé, difficulté technique. Réessayez dans quelques instants.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ ' + errMsg,
        suggestions: voiceLang === 'en-US' ? ['Try again'] : ['Réessayer'],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function enregistrerWolof() {
    try {
      setIsRecording(true);
      window.speechSynthesis?.cancel();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach(t => t.stop());

        const blob = new Blob(chunks, { type: mimeType });
        const formData = new FormData();
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        formData.append('audio', blob, `audio.${ext}`);

        try {
          setLoading(true);
          const response = await fetch(WOLOF_STT_URL, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();

          if (data.success && data.texte) {
            setInput(data.texte);
            voiceModeRef.current = true;
            setTimeout(() => envoyer(data.texte), 300);
          }
        } catch (err) {
          console.error('Erreur STT wolof:', err);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '⚠️ Erreur de reconnaissance wolof. Réessayez.',
            suggestions: ['Réessayer'],
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          }]);
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start(100);
      setTimeout(() => mediaRecorder.stop(), 5000);

    } catch (err) {
      setIsRecording(false);
      console.error('Erreur micro:', err);
      alert('Impossible d\'accéder au microphone');
    }
  }

  function toggleVoice() {
    if (voiceLang === 'wo') {
      if (isRecording) { setIsRecording(false); return; }
      enregistrerWolof();
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(voiceLang === 'en-US' ? 'Not supported. Use Chrome.' : 'Non supporté. Utilisez Chrome.');
      return;
    }
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    const rec = new SpeechRec();
    rec.lang = voiceLang;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    rec.onstart = () => { setIsRecording(true); window.speechSynthesis?.cancel(); };
    rec.onresult = (e) => {
      let interim = '', finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      const display = finalText || interim;
      if (display) setInput(display);
      if (finalText && finalText.trim()) {
        voiceModeRef.current = true;
        recognitionRef.current?.stop();
        setIsRecording(false);
        setTimeout(() => envoyer(finalText.trim()), 280);
      }
    };
    rec.onerror = () => { setIsRecording(false); voiceModeRef.current = false; };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    try { rec.start(); } catch (e) { console.error('STT error:', e); }
  }

  function formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  function reinitialiser() {
    window.speechSynthesis?.cancel();
    voiceModeRef.current = false;
    setMessages([{
      role: 'assistant',
      content: voiceLang === 'en-US'
        ? 'Hello! I am DatoBot, your health assistant.\n\nHow can I help you?'
        : voiceLang === 'wo'
        ? 'Asalaamaalekum ! Maa ngi DatoBot, sa assistant ci wérëwér.\n\nLan laa def ngir yéggël ma ?'
        : 'Bonjour ! Je suis DatoBot, votre assistant santé.\n\nComment puis-je vous aider ?',
      suggestions: voiceLang === 'en-US'
        ? ['I want to see a doctor', 'Video consultation', 'Find a pharmacy']
        : voiceLang === 'wo'
        ? ['Dama bëgg gis doktoor', 'Dama am metiteu', 'Farmaasi bi']
        : ['Je veux voir un médecin', 'Téléconsultation vidéo', 'Pharmacie près de moi'],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }]);
  }

  // Upload ordonnance
  const fileInputRef = useRef(null);

  async function uploadOrdonnance(file) {
    try {
      const formData = new FormData();
      formData.append('ordonnance', file);
      formData.append('session_id', sessionId);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/ordonnances/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'user',
          content: `📄 Ordonnance envoyée : ${file.name}`,
          suggestions: [],
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }]);
        await envoyer(`J'ai envoyé mon ordonnance. URL: ${data.url}`);
      }
    } catch (err) {
      console.error('Erreur upload ordonnance:', err);
    }
  }

  return (
    <div style={{ height: '100vh', height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,#0E1510,#1A3020)', padding: '0 1rem', height: '60px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', textDecoration: 'none', marginRight: '2px', flexShrink: 0 }}>←</Link>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🤖</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>DatoBot</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            {voiceLang === 'en-US' ? 'Health assistant · 24/7' : voiceLang === 'wo' ? 'Assistant wérëwér · 24/7 🇸🇳' : 'Assistant santé · 24h/24'}
            {isRecording && <span style={{ background: '#DC2626', color: '#fff', fontSize: '0.55rem', padding: '1px 5px', borderRadius: '6px', marginLeft: '3px' }}>🎙️</span>}
            {userLocation && <span style={{ fontSize: '0.55rem', color: '#22C55E', marginLeft: '3px' }}>📍</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => speakText('Bonjour je suis DatoBot')}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            🔊
          </button>
          <button onClick={() => window.speechSynthesis?.cancel()}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            ⏹️
          </button>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2px', gap: '1px' }}>
            {[
              { lang: 'fr-FR', flag: '🇫🇷', label: 'FR' },
              { lang: 'en-US', flag: '🇬🇧', label: 'EN' },
              { lang: 'wo', flag: '🇸🇳', label: 'WO' }
            ].map(l => (
              <button key={l.lang} onClick={() => { setVoiceLang(l.lang); reinitialiser(); }}
                style={{ background: voiceLang === l.lang ? '#fff' : 'transparent', border: 'none', borderRadius: '13px', padding: '2px 8px', color: voiceLang === l.lang ? 'var(--green)' : '#fff', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all 0.2s' }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
          <button onClick={reinitialiser}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            🔄
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', WebkitOverflowScrolling: 'touch' }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '7px', alignItems: 'flex-end' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, marginBottom: '2px' }}>🤖</div>
              )}
              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  padding: '0.65rem 0.9rem',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,var(--green),var(--green-mid))' : '#fff',
                  color: msg.role === 'user' ? '#fff' : 'var(--ink)',
                  fontSize: '0.875rem', lineHeight: 1.55,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
                }}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--ink-3)' }}>{msg.time}</span>
                  {msg.role === 'assistant' && (
                    <button onClick={() => speakTextWolof(msg.content)}
                      style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: '0.65rem', padding: '0 1px' }}>
                      🔊
                    </button>
                  )}
                </div>
              </div>
              {msg.role === 'user' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, marginBottom: '2px' }}>🧑</div>
              )}
            </div>

            {/* Suggestions */}
            {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && i === messages.length - 1 && !loading && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', marginLeft: '35px' }}>
                {msg.suggestions.map((s, j) => (
                  <button key={j} onClick={() => envoyer(s)}
                    style={{ background: '#fff', border: '1.5px solid var(--green)', borderRadius: '16px', padding: '5px 12px', fontSize: '0.75rem', color: 'var(--green)', cursor: 'pointer', fontFamily: 'var(--sans)', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseOver={e => { e.target.style.background = 'var(--green)'; e.target.style.color = '#fff'; }}
                    onMouseOut={e => { e.target.style.background = '#fff'; e.target.style.color = 'var(--green)'; }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Feedback wolof */}
            {msg.role === 'assistant' && voiceLang === 'wo' && i > 0 && i === messages.length - 1 && !loading && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', marginLeft: '35px' }}>
                <button
                  onClick={() => envoyerFeedback(messages[i-1]?.content, msg.content, 'bon')}
                  style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: '10px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', color: '#065F46' }}>
                  👍 Dëgg na
                </button>
                <button
                  onClick={() => {
                    const correction = prompt('Saisit la bonne réponse en wolof :');
                    if (correction) envoyerFeedback(messages[i-1]?.content, msg.content, 'mauvais', correction);
                  }}
                  style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', color: '#991B1B' }}>
                  👎 Soppiku
                </button>
                <button
                  onClick={() => enregistrerCorrectionVocale(messages[i-1]?.content, msg.content)}
                  style={{ background: '#EDE9FE', border: '1px solid #C4B5FD', borderRadius: '10px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', color: '#5B21B6' }}>
                  🎙️ Wax correction bi
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Indicateur de frappe */}
        {loading && (
          <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-end' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🤖</div>
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '0.65rem 0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--ink-3)', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Indicateur enregistrement */}
      {isRecording && (
        <div style={{ padding: '0.4rem 1rem', background: '#FEE2E2', borderTop: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#DC2626', animation: 'pulse 1s infinite' }} />
          <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
            {voiceLang === 'wo'
              ? '🇸🇳 Dëgg naa... Wax wolof (5 secondes)'
              : voiceLang === 'en-US'
              ? 'Listening... Speak now'
              : 'Écoute en cours... Parlez'}
          </span>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center', marginLeft: '4px' }}>
            {[4, 10, 14, 10, 4].map((h, i) => (
              <div key={i} style={{ width: '2px', height: `${h}px`, borderRadius: '2px', background: '#DC2626', animation: `wave 0.8s ${i * 0.15}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* INPUT */}
      <div style={{ padding: '0.65rem 1rem', background: '#fff', borderTop: '1px solid var(--border)', flexShrink: 0, paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'var(--green-pale)', border: '1.5px solid', borderColor: isRecording ? '#DC2626' : 'var(--border)', borderRadius: '12px', padding: '5px 5px 5px 12px', transition: 'border-color 0.2s' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && envoyer()}
            placeholder={
              isRecording
                ? (voiceLang === 'wo' ? 'Dëgg naa...' : voiceLang === 'en-US' ? 'Listening...' : 'Écoute...')
                : (voiceLang === 'wo' ? 'Bind ci wolof...' : voiceLang === 'en-US' ? 'Ask DatoBot...' : 'Posez votre question...')
            }
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', minWidth: 0 }}
          />

          {/* Bouton upload ordonnance */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={e => e.target.files[0] && uploadOrdonnance(e.target.files[0])}
          />
          <button onClick={() => fileInputRef.current?.click()}
            style={{ width: '34px', height: '34px', borderRadius: '9px', border: 'none', background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.9rem', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📄
          </button>

          <button onClick={toggleVoice}
            style={{ width: '34px', height: '34px', borderRadius: '9px', border: 'none', background: isRecording ? '#DC2626' : voiceLang === 'wo' ? '#006B3F' : 'var(--green-light)', color: isRecording ? '#fff' : voiceLang === 'wo' ? '#fff' : 'var(--green)', fontSize: '0.9rem', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            {isRecording ? '⏹️' : voiceLang === 'wo' ? '🇸🇳' : '🎙️'}
          </button>
          <button onClick={() => envoyer()} disabled={loading || !input.trim()}
            style={{ width: '34px', height: '34px', borderRadius: '9px', border: 'none', background: loading || !input.trim() ? 'var(--border)' : 'var(--green)', color: '#fff', fontSize: '0.9rem', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ➤
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--ink-3)', marginTop: '4px' }}>
          {voiceLang === 'wo' ? 'Wolof STT · Railway 🇸🇳' : voiceLang === 'en-US' ? 'For emergencies call 15.' : 'Pour les urgences appelez le 15.'}
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes wave { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
      `}</style>
    </div>
  );
}