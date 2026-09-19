import React, { useState, useEffect, useRef } from 'react';
import officialLogoImg from '../assets/images/agrilink_official_logo.jpg';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Clock,
  MapPin,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  Grid,
  Radio,
  User,
  Activity,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { playRingtone, playConnectedChime, playEndCallTone, playDTMF } from '../utils/callAudio.ts';

interface CallCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUSSD?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
}

interface AgentResponse {
  keywords: string[];
  answer: string;
  answerAm: string;
  answerOm: string;
}

const AGENT_RESPONSES: AgentResponse[] = [
  {
    keywords: [
      'escrow', 'payment', 'telebirr', 'cbe', 'money', 'birr', 'payout', 'withdraw',
      'ክፍያ', 'እምነት', 'ቴሌብር', 'ብር', 'ማውጣት',
      'kanfaltee', 'kaffaltii', 'qarshii', 'baasuu', 'amanamaa'
    ],
    answer:
      'AgriLink Escrow holds 100% of buyer funds in trust under National Bank of Ethiopia Directive FX-824. Once the buyer confirms delivery, 98% is instantly disbursed to the farmer wallet, redeemable via Telebirr or CBE Birr within 5 minutes.',
    answerAm:
      'የአግሪሊንክ የእምነት ሂሳብ (Escrow) የገዢውን ክፍያ በኢትዮጵያ ብሔራዊ ባንክ መመሪያ መሰረት በአስተማማኝ ሁኔታ ይይዛል። ገዢው ምርቱ መድረሱን ሲያረጋግጥ 98% ገንዘብ ወዲያውኑ ወደ ገበሬው ቦርሳ ይተላለፋል፤ በቴሌብር ወይም በንግድ ባንክ ወዲያውኑ ማውጣት ይቻላል።',
    answerOm:
      "AgriLink Escrow maallaqa biteessaa qajeelfama Baankii Biyyooleessaa Itoophiyaa FX-824 jalatti amanamummaadhaan qaba. Erga biteessaan oomishni ga'uu mirkaneeffatee booda, dhibbeentaan 98 hatattamaan boorsaa qotee-bulaatti darba; Telebirr ykn CBE Birriin daqiiqaa 5 keessatti baasuu dandeessu.",
  },
  {
    keywords: [
      'price', 'market', 'teff', 'coffee', 'wheat', 'rate', 'ecx',
      'ዋጋ', 'ገበያ', 'ጤፍ', 'ቡና', 'ስንዴ', 'ኢምገ',
      'gabaa', 'gatii', 'xaafii', 'buna', 'qamadii'
    ],
    answer:
      'Current live ECX benchmarks: White Teff Magna is trading at 9,450 ETB/Quintal (+2.4%), Yirgacheffe Grade 1 Coffee is at 4,850 ETB/Feresula, and Durum Wheat is at 5,800 ETB/Quintal in Addis Ababa corridors.',
    answerAm:
      'የዛሬው የኢምገ የቀጥታ የገበያ ዋጋ፡ ነጭ ማግና ጤፍ በኩንታል 9,450 ብር፣ ይርጋጨፌ አንደኛ ደረጃ ቡና በፈረሱላ 4,850 ብር፣ እንዲሁም ስንዴ በኩንታል 5,800 ብር በአዲስ አበባ መገበያያ እየተሸጠ ይገኛል።',
    answerOm:
      "Gatiin gabaa ECX har'aa: Xaafii Maagnaa adii kuntaala tokko 9,450 ETB (+2.4%), Buna Yirgaacaffee Sadarkaa 1ffaa farrasulaan 4,850 ETB, akkasumas Qamadiin kuntaalaan 5,800 ETB giddugala gabaa Finfinneetti gurguramaa jira.",
  },
  {
    keywords: [
      'logistics', 'truck', 'deliver', 'freight', 'transport', 'reefer',
      'ቀዝቃዛ', 'ትራንስፖርት', 'መኪና', 'ጭነት', 'ማድረስ',
      'fe\'isa', 'konkolaataa', 'geejjiba', 'geessuu', 'qabbaneessituu'
    ],
    answer:
      'Our certified refrigerated fleet operates along the Mojo-Adama, Wonji, and Hawassa corridors. Temperature is continuously logged at 4°C with live GPS dispatch tracking to ensure zero post-harvest spoilage.',
    answerAm:
      'የቀዝቃዛ ሰንሰለት የጭነት መኪኖቻችን በሞጆ-አዳማ፣ ወንጂ እና ሐዋሳ የንግድ ኮሪደሮች ላይ በንቃት እየሰሩ ነው። የሙቀት መጠኑ በ4 ዲግሪ ሴልሺየስ ክትትል የሚደረግበት ሲሆን የቀጥታ ጂፒኤስ ክትትል አለው።',
    answerOm:
      "Konkolaattonni geejjibaa qabbaneessituu qaban sarara daldalaa Moojoo-Adaamaa, Wancii fi Hawaasaa irratti hojjetaa jiru. Ho'i qilleensaa digirii seentigireedii 4 irratti to'atama; hordoffiin GPS battalatti oomishni akka hin banne eega.",
  },
  {
    keywords: [
      'farmer', 'list', 'harvest', 'sell', 'produce',
      'ምርት', 'መሸጥ', 'ገበሬ', 'እርሻ', 'ዝርዝር',
      'oomisha', 'qotee bulaa', 'gurguruu', 'galmeessuu'
    ],
    answer:
      'To list your harvest, navigate to your Farmer Workspace, tap "Harvest Listings", and enter your crop variety, quantity in quintals, and warehouse location. Verified buyers will receive automated RFQs immediately.',
    answerAm:
      'ምርትዎን ለመዘርዘር ወደ ገበሬው የስራ ቦታ ይሂዱና "የመኸር ዝርዝር" የሚለውን ይጫኑ፤ የሰብሉን አይነት፣ መጠን በኩንታል እና ቦታውን ያስገቡ። ወዲያውኑ ለተረጋገጡ ገዢዎች ይደርሳል።',
    answerOm:
      "Oomisha keessan galmeessuuf gara bakka hojii Qotee Bulaa deemuun 'Oomisha Galmeessi' kan jedhu cuqaasaa; gosa oomishaa, baay'ina kuntaalaan fi iddoo kuusaa galchaa. Biteeyyiin mirkanaa'an battalatti isin qunnamu.",
  },
  {
    keywords: [
      'dispute', 'problem', 'delay', 'issue', 'complaint',
      'አለመግባባት', 'ቅሬታ', 'ችግር', 'መዘግየት',
      'walgidduu', 'komii', 'rakkoo', 'waldhabdee'
    ],
    answer:
      'Every transaction is backed by our Sovereign Dispute Arbitration Protocol. Funds remain safely frozen in escrow while our dedicated field inspection team verifies the consignment within 2 hours.',
    answerAm:
      'እያንዳንዱ ግብይት በህጋዊ የግልግል ዳኝነት የተጠበቀ ነው። በእምነት ሂሳብ የተያዘው ገንዘብ በደህና ተቆልፎ የሚቆይ ሲሆን የቴክኒክ ቡድናችን በ2 ሰዓት ውስጥ አጣርቶ ውሳኔ ይሰጣል።',
    answerOm:
      "Gurgurtaan hundi seera araara daldalaa biyyaalessaatiin kan eegamedha. Qarshiin amanamummaadhaan yoo qabamu, gareen inspeekshinii dirree keenya sa'aatii 2 keessatti qoratee furmaata kenna.",
  },
];

export const CallCenterModal: React.FC<CallCenterModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage, setLanguage } = useTranslation();

  // Navigation Tabs: 'call' | 'chat' | 'numbers'
  const [activeTab, setActiveTab] = useState<'call' | 'chat' | 'numbers'>('call');

  // ── Live Voice Call State ──────────────────────────────────────────────
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [showDialpad, setShowDialpad] = useState(false);
  const [dialedKeys, setDialedKeys] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceCallMessages, setVoiceCallMessages] = useState<ChatMessage[]>([]);
  const [spokenInput, setSpokenInput] = useState('');

  // ── Text Chat State ──────────────────────────────────────────────────
  const getGreetingByLang = (lang: string) => {
    if (lang === 'am') {
      return 'ሰላም! እንኳን ወደ አግሪሊንክ የቀጥታ የድጋፍ መስመር በደህና መጡ። እኔ ትዕግስት ነኝ፤ በምን ላግዝዎ እችላለሁ?';
    }
    if (lang === 'om') {
      return 'Akkam! Baga gara gargaarsa sarara kallattii AgriLink nagaan dhuftan. Ani Tigistii dha; maaliin isin gargaaruu danda\'a?';
    }
    return 'Hello! Welcome to AgriLink Live Support Desk. I am Tigist Alemayehu. How can I assist you with your agricultural trade, escrow, or delivery today?';
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: getGreetingByLang(currentLanguage),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  // ── Callback Form State ──────────────────────────────────────────────
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTopic, setCallbackTopic] = useState('Trade Support & Escrow');
  const [callbackRequested, setCallbackRequested] = useState(false);

  const stopRingtoneRef = useRef<(() => void) | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const voiceScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Keep initial chat greeting in sync with selected language
  useEffect(() => {
    setChatMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [
          {
            id: 'init-1',
            sender: 'agent',
            text: getGreetingByLang(currentLanguage),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [currentLanguage]);

  // ── Call Timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (callStatus === 'connected') {
      timerIntervalRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [callStatus]);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      handleEndCall();
    }
  }, [isOpen]);

  // Scroll to bottom of transcripts
  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isAgentTyping]);

  useEffect(() => {
    voiceScrollRef.current?.scrollTo({ top: voiceScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [voiceCallMessages, isSpeaking]);

  // ── Fallback Browser Speech Synthesis (Offline Fallback) ─────────────
  const fallbackSpeechSynthesis = (text: string, lang: 'en' | 'am' | 'om') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const targetLangCode = lang === 'am' ? 'am-ET' : lang === 'om' ? 'om-ET' : 'en-US';
      utterance.lang = targetLangCode;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(lang) ||
          (lang === 'en' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')))
      );
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // ── High-Fidelity Audio Playback (Speaks Amharic, Oromifa & English) ──
  const speakText = (text: string, overrideLang?: 'en' | 'am' | 'om') => {
    const lang = overrideLang || currentLanguage;

    // Halt any playing audio or synthesis
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (isSpeakerMuted || !text.trim()) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    try {
      const ttsUrl = `/api/tts?lang=${lang}&text=${encodeURIComponent(text.trim())}`;
      const audio = new Audio(ttsUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };

      audio.onerror = (err) => {
        console.warn('TTS streaming endpoint issue, switching to browser synthesis:', err);
        currentAudioRef.current = null;
        fallbackSpeechSynthesis(text, lang);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play() prevented by browser policy, switching to synthesis fallback:', err);
          currentAudioRef.current = null;
          fallbackSpeechSynthesis(text, lang);
        });
      }
    } catch (err) {
      console.warn('Audio constructor failure, falling back:', err);
      fallbackSpeechSynthesis(text, lang);
    }
  };

  // ── Toggle Speaker Mute ──────────────────────────────────────────────
  const toggleSpeakerMute = () => {
    setIsSpeakerMuted((prev) => {
      const next = !prev;
      if (next) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
          currentAudioRef.current = null;
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
      }
      return next;
    });
  };

  // ── Speech Recognition (User Voice) ──────────────────────────────────
  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = currentLanguage === 'am' ? 'am-ET' : currentLanguage === 'om' ? 'om-ET' : 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          handleUserQuery(transcript, true);
        }
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // ── Start Call Flow ──────────────────────────────────────────────────
  const handleStartCall = () => {
    setCallStatus('calling');
    setCallDuration(0);
    setVoiceCallMessages([]);
    stopRingtoneRef.current = playRingtone();

    // Answer after 2.6 seconds
    setTimeout(() => {
      if (stopRingtoneRef.current) stopRingtoneRef.current();
      playConnectedChime();
      setCallStatus('connected');

      const greetingText =
        currentLanguage === 'am'
          ? 'ጤና ይስጥልኝ! እንኳን ወደ አግሪሊንክ የግብርና ንግድ እና የእምነት ሂሳብ የቀጥታ መስመር በደህና መጡ። እኔ ትዕግስት ነኝ፤ ዛሬ በምን ላግዝዎ እችላለሁ?'
          : currentLanguage === 'om'
          ? "Akkam jirtu! Baga nagaan gara giddugala bilbila kallattii daldala qonnaa fi amanamummaa AgriLink dhuftan. Ani Tigisti dha; har'a akkamiin isin gargaaruu danda'a?"
          : 'Hello! Welcome to AgriLink National Agricultural Exchange and Escrow Helpdesk. I am Tigist Alemayehu. How can I assist you with your harvest, payment, or delivery today?';

      const greetingMsg: ChatMessage = {
        id: `call-${Date.now()}`,
        sender: 'agent',
        text: greetingText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setVoiceCallMessages([greetingMsg]);
      speakText(greetingText);
    }, 2600);
  };

  // ── End Call Flow ────────────────────────────────────────────────────
  const handleEndCall = () => {
    if (stopRingtoneRef.current) stopRingtoneRef.current();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    playEndCallTone();
    setCallStatus('ended');
    setIsSpeaking(false);

    setTimeout(() => {
      setCallStatus('idle');
      setCallDuration(0);
      setDialedKeys('');
      setShowDialpad(false);
    }, 1500);
  };

  // ── Process Query & Respond ─────────────────────────────────────────
  const handleUserQuery = (queryText: string, isVoice: boolean) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (isVoice) {
      setVoiceCallMessages((prev) => [...prev, userMsg]);
      setSpokenInput('');
    } else {
      setChatMessages((prev) => [...prev, userMsg]);
      setChatInput('');
      setIsAgentTyping(true);
    }

    // Match intelligent answer across all languages
    const lower = queryText.toLowerCase();
    const match = AGENT_RESPONSES.find((r) => r.keywords.some((k) => lower.includes(k)));

    const answerText = match
      ? currentLanguage === 'am'
        ? match.answerAm
        : currentLanguage === 'om'
        ? match.answerOm
        : match.answer
      : currentLanguage === 'am'
      ? 'ጥያቄዎትን ተቀብያለሁ። በአግሪሊንክ የእምነት ሂሳብ፣ የትራንስፖርት ክትትል ወይም የሰብል ዋጋ ዙሪያ ተጨማሪ ዝርዝር ካስፈለግዎ እኔን ወይም ዋና መስመራችንን 0961123330 ማነጋገር ይችላሉ።'
      : currentLanguage === 'om'
      ? "Gaaffii keessan simadheera. Waa'ee herreega amanamummaa AgriLink, geejjibaa ykn gatii oomishaa irratti odeeffannoo dabalataaf ani ykn sarara bilbilaa 0961123330 qunnamuu dandeessu."
      : 'Thank you for your inquiry. Our central trade desk verifies every transaction under NBE escrow guarantees. You can also monitor your active consignments or reach our dispatch direct on 0961123330.';

    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: answerText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (isVoice) {
        setVoiceCallMessages((prev) => [...prev, agentMsg]);
        speakText(answerText);
      } else {
        setIsAgentTyping(false);
        setChatMessages((prev) => [...prev, agentMsg]);
      }
    }, isVoice ? 600 : 1200);
  };

  // ── DTMF Keypad Press ────────────────────────────────────────────────
  const handleKeypadPress = (key: string) => {
    playDTMF(key);
    setDialedKeys((prev) => (prev + key).slice(-10));

    if (key === '1') {
      handleUserQuery(
        currentLanguage === 'am'
          ? 'የእምነት ሂሳብ የክፍያ ሁኔታዬን አሳውቂኝ'
          : currentLanguage === 'om'
          ? 'Haala kaffaltii herreega amanamummaa koo natti himaa'
          : 'Check my escrow payment balance',
        true
      );
    } else if (key === '2') {
      handleUserQuery(
        currentLanguage === 'am'
          ? 'የቀዝቃዛ ሰንሰለት የትራንስፖርት እና የጭነት መኪናዬ የት ደረሰ?'
          : currentLanguage === 'om'
          ? "Geejjibni konkolaataa qabbaneessituu oomisha koo eessa ga'e?"
          : 'Check freight logistics and truck dispatch',
        true
      );
    } else if (key === '3') {
      handleUserQuery(
        currentLanguage === 'am'
          ? 'የዛሬው የኢትዮጵያ ምርት ገበያ (ኢምገ) ዋጋዎች ስንት ናቸው?'
          : currentLanguage === 'om'
          ? "Gatiin gabaa oomishaalee ECX har'aa meeqa?"
          : 'What are today ECX commodity prices?',
        true
      );
    } else if (key === '4') {
      handleUserQuery(
        currentLanguage === 'am'
          ? 'የንግድ አለመግባባት ወይም ቅሬታ ማስመዝገብ እፈልጋለሁ'
          : currentLanguage === 'om'
          ? 'Waldhabdee daldalaa ykn komii galmeessuu barbaada'
          : 'I want to report a trade dispute',
        true
      );
    } else if (key === '0') {
      const operatorMsg =
        currentLanguage === 'am'
          ? 'ከከፍተኛ የእምነት ሂሳብ አማካሪ ትዕግስት አለማየሁ ጋር እየተገናኙ ነው። በምን ላግዝዎ እችላለሁ?'
          : currentLanguage === 'om'
          ? 'Gorsituu Olaantuu Herreega Amanamummaa Tigist Alamayyahuu wajjin wal qunnamsiisaa jirra. Akkamiin isin gargaaruu dandeessu?'
          : 'Connecting you with Senior Escrow Officer Tigist Alemayehu. How can I assist you?';
      speakText(operatorMsg);
    }
  };

  // Format mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;
    setCallbackRequested(true);
    setTimeout(() => {
      setCallbackRequested(false);
      setCallbackName('');
      setCallbackPhone('');
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 p-5 sm:p-6 text-white border-b border-emerald-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={officialLogoImg}
                  alt="AgriLink Official"
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-amber-400/80 shadow-md"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    AgriLink Live Call Center
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE 24/7
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">
                  National Trade Assistance &bull; Escrow Resolution &bull; Dispatch Desk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* In-Modal Language Switcher Pill */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-emerald-500/30">
                <Globe2 className="h-3.5 w-3.5 text-emerald-400 ml-1.5 mr-0.5" />
                {(['en', 'am', 'om'] as const).map((langCode) => (
                  <button
                    key={langCode}
                    onClick={() => {
                      setLanguage(langCode);
                      if (isSpeaking && currentAudioRef.current) {
                        currentAudioRef.current.pause();
                        currentAudioRef.current = null;
                        setIsSpeaking(false);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                      currentLanguage === langCode
                        ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                        : 'text-zinc-300 hover:text-white hover:bg-white/10'
                    }`}
                    title={
                      langCode === 'en'
                        ? 'English Voice & UI'
                        : langCode === 'am'
                        ? 'የአማርኛ ድምፅ እና ገፅታ'
                        : 'Sagalee fi Barreeffama Afaan Oromoo'
                    }
                  >
                    {langCode === 'en' ? 'EN' : langCode === 'am' ? 'አማ' : 'ORM'}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold shrink-0"
                title="Close Call Center"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-emerald-800/40 relative z-10">
            <button
              onClick={() => setActiveTab('call')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'call'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/15 text-zinc-200'
              }`}
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>
                {currentLanguage === 'am'
                  ? 'የቀጥታ የድምፅ ጥሪ'
                  : currentLanguage === 'om'
                  ? 'Bilbila Sagalee Kallattii'
                  : 'Live Voice Call'}{' '}
                {callStatus === 'connected' && `(${formatTimer(callDuration)})`}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/15 text-zinc-200'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>
                {currentLanguage === 'am'
                  ? 'የቀጥታ ፅሁፍ ውይይት'
                  : currentLanguage === 'om'
                  ? 'Waliin Dubbii Kallattii'
                  : 'Live Agent Chat'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('numbers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'numbers'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/15 text-zinc-200'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {currentLanguage === 'am'
                  ? 'የቀጥታ መስመሮች (0961123330)'
                  : currentLanguage === 'om'
                  ? 'Sarara Kallattii (0961123330)'
                  : 'Direct Hotlines (0961123330)'}
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 bg-zinc-50/50 flex flex-col">
          {/* ════════════════════════════════════════════════════════════════
              TAB 1: LIVE VOICE CALL
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'call' && (
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-6">
              {/* Call Status Card */}
              {callStatus === 'idle' && (
                <div className="text-center py-8 px-4 space-y-5 my-auto">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 p-1 shadow-2xl mx-auto ring-4 ring-emerald-500/20">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
                        alt="Tigist Alemayehu"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
                      <Activity className="h-3 w-3 text-white" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900">
                      Tigist Alemayehu
                    </h3>
                    <p className="text-xs text-emerald-700 font-bold mt-0.5">
                      {currentLanguage === 'am'
                        ? 'ከፍተኛ የግብርና እምነት ሂሳብ እና የሎጂስቲክስ ባለሙያ'
                        : currentLanguage === 'om'
                        ? 'Ogeettii Olaantoo Herreega Amanamummaa Qonnaa fi Geejjibaa'
                        : 'Senior Agri-Escrow & Freight Logistics Specialist'}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                      {currentLanguage === 'am'
                        ? 'በመስመር ላይ ትገኛለች። በመሳሪያዎ ስፒከር እና ማይክሮፎን በመጠቀም ከቡድናችን ጋር በቀጥታ በድምፅ ይነጋገሩ።'
                        : currentLanguage === 'om'
                        ? 'Amma toora irra jirti. Sagalee fi maayikiroofoonii fayyadamuun kallattiin garee keenya wajjin dubbadhaa.'
                        : 'Available online now. Connect with voice directly through your device speakers and microphone to talk with our team live.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleStartCall}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>
                        {currentLanguage === 'am'
                          ? 'የቀጥታ የድምፅ ጥሪ ጀምር'
                          : currentLanguage === 'om'
                          ? 'Bilbila Sagalee Kallattii Jalqabi'
                          : 'Start Live Voice Call'}
                      </span>
                    </button>
                    <a
                      href="tel:0961123330"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span>
                        {currentLanguage === 'am'
                          ? 'በስልክ ደውል (0961123330)'
                          : currentLanguage === 'om'
                          ? 'Bilbilaan Bilbili (0961123330)'
                          : 'Dial Phone (0961123330)'}
                      </span>
                    </a>
                  </div>
                </div>
              )}

              {/* Calling / Ringing State */}
              {callStatus === 'calling' && (
                <div className="text-center py-12 px-4 space-y-6 my-auto">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto ring-8 ring-emerald-500/20 animate-pulse">
                      <PhoneCall className="h-10 w-10 text-emerald-600 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900">
                      {currentLanguage === 'am'
                        ? 'ወደ ማዕከላዊ የንግድ መስመር እየተገናኘ ነው...'
                        : currentLanguage === 'om'
                        ? 'Gara sarara daldala giddugaleessaatti walqunnamsiisaa jira...'
                        : 'Connecting to Central Trade Desk...'}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {currentLanguage === 'am'
                        ? 'በአዲስ አበባ የኢንተርባንክ እምነት ሂሳብ ልውውጥ መስመር በመደወል ላይ...'
                        : currentLanguage === 'om'
                        ? 'Sarara daldala Baankii Finfinnee irraan bilbilamaa jira...'
                        : 'Routing through Addis Ababa Interbank Escrow Exchange Node • Dialing...'}
                    </p>
                  </div>
                  <button
                    onClick={handleEndCall}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    <PhoneOff className="h-4 w-4" />
                    <span>
                      {currentLanguage === 'am'
                        ? 'ጥሪውን ሰርዝ'
                        : currentLanguage === 'om'
                        ? 'Bilbila Haqi'
                        : 'Cancel Call'}
                    </span>
                  </button>
                </div>
              )}

              {/* Connected Active Call State */}
              {callStatus === 'connected' && (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Active Header Pill */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950 text-white border border-emerald-800/80 shadow-md">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                        alt="Tigist Alemayehu"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-white">Tigist Alemayehu</p>
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-[10px] text-emerald-300">
                          {currentLanguage === 'am'
                            ? 'በጥሪ ላይ • ከፍተኛ አማካሪ'
                            : currentLanguage === 'om'
                            ? 'Bilbila irra • Gorsituu Olaantoo'
                            : 'Live on Call • Senior Advisor'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Audio Wave Visualizer */}
                      <div className="flex items-center gap-1 h-6 px-3 bg-zinc-900/60 rounded-full border border-emerald-500/30">
                        {[0.4, 0.8, 0.3, 0.9, 0.5, 0.7, 0.2].map((height, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full bg-emerald-400 transition-all duration-150 ${
                              isSpeaking
                                ? 'animate-pulse'
                                : 'opacity-40'
                            }`}
                            style={{ height: isSpeaking ? `${Math.max(6, height * 20)}px` : '6px' }}
                          />
                        ))}
                      </div>

                      <div className="font-mono text-sm font-extrabold text-emerald-300 px-3 py-1 bg-black/40 rounded-xl border border-emerald-800/50">
                        {formatTimer(callDuration)}
                      </div>
                    </div>
                  </div>

                  {/* Live Conversation Transcript Stream */}
                  <div
                    ref={voiceScrollRef}
                    className="flex-1 max-h-56 min-h-40 overflow-y-auto p-4 rounded-2xl bg-white border border-zinc-200/90 space-y-3 text-xs shadow-inner"
                  >
                    {voiceCallMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl shadow-2xs ${
                            m.sender === 'user'
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-zinc-100 text-zinc-900 rounded-bl-xs border border-zinc-200/80'
                          }`}
                        >
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                        <span className="text-[9px] text-zinc-400 mt-0.5 px-1">{m.time}</span>
                      </div>
                    ))}
                    {isSpeaking && (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold animate-pulse">
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>
                          {currentLanguage === 'am'
                            ? 'ትዕግስት በአማርኛ እየተናገረች ነው...'
                            : currentLanguage === 'om'
                            ? 'Tigist Afaan Oromootiin dubbachaa jirti...'
                            : 'Tigist is speaking...'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Interactive DTMF Dialpad Drawer */}
                  {showDialpad && (
                    <div className="p-3 bg-zinc-900 rounded-2xl text-white space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs px-2 text-zinc-400 font-mono">
                        <span>DTMF Keypad: {dialedKeys || 'Press any key'}</span>
                        <span className="text-[10px] text-emerald-400">1: Escrow | 2: Logistics | 3: ECX Prices</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                          <button
                            key={k}
                            onClick={() => handleKeypadPress(k)}
                            className="py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 rounded-xl font-mono font-black text-sm text-center transition-colors cursor-pointer"
                          >
                            {k}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Instant Spoken Questions */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      {currentLanguage === 'am'
                        ? 'ፈጣን ጥያቄዎች (ለትዕግስት ለመጠየቅ ይጫኑ)፡'
                        : currentLanguage === 'om'
                        ? 'Gaaffilee Hatattamaa (Tigist gaafachuuf cuqaasaa):'
                        : 'Quick Questions (Tap to ask Tigist):'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(currentLanguage === 'am'
                        ? [
                            'የቴሌብር የእምነት ሂሳብ ክፍያ እንዴት ይሰራል?',
                            'የዛሬው የጤፍ እና የቡና የገበያ ዋጋ ስንት ነው?',
                            'የቀዝቃዛ ማከማቻ መኪናዬ የት ደረሰ?',
                            'አዲስ ምርት እንዴት መዘርዘር እችላለሁ?',
                          ]
                        : currentLanguage === 'om'
                        ? [
                            'Kaffaltiin Telebirr akkamiin eegama?',
                            'Gatiin xaafii fi bunaa har\'aa meeqa?',
                            'Geejjibni konkolaataa qabbaneessituu eessa ga\'e?',
                            'Oomisha haaraa akkamiin gurgurtaaf galmeessu?',
                          ]
                        : [
                            'How does escrow protect my Telebirr payment?',
                            'What is the current ECX price for Teff?',
                            'Where is my refrigerated truck delivery?',
                            'How can I list a new crop harvest?',
                          ]
                      ).map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleUserQuery(prompt, true)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:border-emerald-300 border border-zinc-200/80 text-zinc-700 hover:text-emerald-950 text-xs font-semibold transition-all cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spoken Query Input / Mic Trigger */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={spokenInput}
                      onChange={(e) => setSpokenInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUserQuery(spokenInput, true);
                      }}
                      placeholder={
                        currentLanguage === 'am'
                          ? 'ጥያቄዎን ፅፈው ለትዕግስት በድምፅ ያዳምጡ...'
                          : currentLanguage === 'om'
                          ? 'Gaaffii keessan barreessaa sagaleen dhaggeeffadhaa...'
                          : 'Type a query to ask Tigist aloud...'
                      }
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={() => handleUserQuery(spokenInput, true)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      {currentLanguage === 'am' ? 'ጠይቅ' : currentLanguage === 'om' ? 'Gaafadhu' : 'Ask'}
                    </button>
                  </div>

                  {/* In-Call Controls Bar */}
                  <div className="flex items-center justify-center gap-4 pt-2 border-t border-zinc-200/80">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isMuted
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                      }`}
                      title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={toggleSpeakerMute}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSpeakerMuted
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                      }`}
                      title={isSpeakerMuted ? 'Unmute Speaker Voice' : 'Mute Speaker Voice'}
                    >
                      {isSpeakerMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => setShowDialpad(!showDialpad)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        showDialpad
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                      }`}
                      title="Toggle Dialpad"
                    >
                      <Grid className="h-5 w-5" />
                    </button>

                    {/* Microphone speech recognition */}
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`px-4 py-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isListening
                          ? 'bg-red-500 text-white border-red-600 animate-pulse'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      }`}
                      title="Speak into Microphone"
                    >
                      <Radio className="h-4 w-4" />
                      <span>
                        {isListening
                          ? currentLanguage === 'am'
                            ? 'እያዳመጥኩ ነው...'
                            : currentLanguage === 'om'
                            ? 'Dhaggeeffachaa jira...'
                            : 'Listening...'
                          : currentLanguage === 'am'
                          ? 'በድምፅ ተናገር'
                          : currentLanguage === 'om'
                          ? 'Sagaleen Dubbadhu'
                          : 'Talk via Mic'}
                      </span>
                    </button>

                    {/* End Call Button */}
                    <button
                      onClick={handleEndCall}
                      className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-102 cursor-pointer"
                    >
                      <PhoneOff className="h-5 w-5" />
                      <span>
                        {currentLanguage === 'am'
                          ? 'ጥሪውን አቋርጥ'
                          : currentLanguage === 'om'
                          ? 'Bilbila Cufi'
                          : 'End Call'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Call Ended Summary */}
              {callStatus === 'ended' && (
                <div className="text-center py-12 px-4 space-y-4 my-auto">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto">
                    <PhoneOff className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900">
                      {currentLanguage === 'am'
                        ? 'ጥሪው ተጠናቋል'
                        : currentLanguage === 'om'
                        ? 'Bilbilli Xumurameera'
                        : 'Call Ended'}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {currentLanguage === 'am'
                        ? `የጥሪ ቆይታ፡ ${formatTimer(callDuration)}። አግሪሊንክ የቀጥታ መስመርን ስለተጠቀሙ እናመሰግናለን።`
                        : currentLanguage === 'om'
                        ? `Turtii bilbilaa: ${formatTimer(callDuration)}. Tajaajila sarara bilbila AgriLink waan fayyadamtaniif galatoomaa.`
                        : `Call duration: ${formatTimer(callDuration)}. Thank you for contacting AgriLink Live Desk.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: LIVE AGENT CHAT STREAM
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4">
              {/* Agent Overview Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                    alt="Tigist"
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500"
                  />
                  <div>
                    <p className="text-xs font-black text-zinc-900">Tigist Alemayehu</p>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {currentLanguage === 'am'
                        ? 'አሁን ንቁ ናት • በቅጽበት ትመልሳለች'
                        : currentLanguage === 'om'
                        ? 'Amma toora irra jirti • Hatattamaan deebisti'
                        : 'Active Now • Typically responds in seconds'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('call')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>
                    {currentLanguage === 'am'
                      ? 'ወደ ድምፅ ቀይር'
                      : currentLanguage === 'om'
                      ? 'Gara Sagaleetti Jijjiiri'
                      : 'Switch to Voice'}
                  </span>
                </button>
              </div>

              {/* Chat Message Stream */}
              <div
                ref={chatScrollRef}
                className="flex-1 min-h-[300px] max-h-[380px] overflow-y-auto p-4 rounded-2xl bg-white border border-zinc-200/90 space-y-3 text-xs shadow-inner"
              >
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl shadow-2xs ${
                        m.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-zinc-100 text-zinc-900 rounded-bl-xs border border-zinc-200/70'
                      }`}
                    >
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-0.5 px-1">{m.time}</span>
                  </div>
                ))}
                {isAgentTyping && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-100 px-3 py-2 rounded-xl w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {currentLanguage === 'am'
                        ? 'ትዕግስት በመጻፍ ላይ ነች...'
                        : currentLanguage === 'om'
                        ? 'Tigist barreessaa jirti...'
                        : 'Tigist is typing...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Suggested Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5">
                {(currentLanguage === 'am'
                  ? [
                      'የእምነት ሂሳብ ክፍያ እንዴት ይጠብቃል?',
                      'የዛሬው የጤፍ ዋጋ ስንት ነው?',
                      'የጭነት መኪናዬን እንዴት እከታተላለሁ?',
                    ]
                  : currentLanguage === 'om'
                  ? [
                      'Kaffaltiin amanamummaa akkamiin eegama?',
                      'Gatiin xaafii har\'aa meeqa?',
                      'Geejjiba konkolaataa akkamiin hordofa?',
                    ]
                  : [
                      'How does escrow lock protect my payment?',
                      'What are today ECX teff prices?',
                      'How to track my truck dispatch?',
                    ]
                ).map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUserQuery(chip, false)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-zinc-200 text-zinc-700 hover:text-emerald-950 text-xs font-medium transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUserQuery(chatInput, false);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    currentLanguage === 'am'
                      ? 'መልዕክትዎን እዚህ ፅፈው ይላኩ...'
                      : currentLanguage === 'om'
                      ? 'Ergaa keessan asitti barreessaa...'
                      : 'Type your message to talk with our team...'
                  }
                  className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow-md transition cursor-pointer"
                  title="Send Message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: DIRECT HOTLINES & REGIONAL DESKS
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'numbers' && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Primary National Hotline */}
              <div className="bg-gradient-to-br from-emerald-950 to-zinc-900 border border-emerald-800/60 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      National Central Hotline
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      24/7 Live
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-white mt-1">0961123330</h3>
                  <p className="text-xs text-zinc-300 mt-1 max-w-md">
                    Direct line for payment verification, escrow disputes, refrigerated logistics dispatch, and farmer registration.
                  </p>
                </div>
                <a
                  href="tel:0961123330"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition-all hover:scale-102 cursor-pointer shrink-0"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call 0961123330</span>
                </a>
              </div>

              {/* Regional Desks Grid */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Regional Agricultural Corridor Desks:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      name: 'Oromia & Rift Valley Trade Corridor',
                      hub: 'Adama Hub & Mojo Agro-Terminal',
                      phone: '+251 22 111 8840',
                      hours: 'Mon - Sat: 7:00 AM - 9:00 PM',
                    },
                    {
                      name: 'Sidama & Southern Cold-Chain Desk',
                      hub: 'Hawassa Industrial Agri-Park',
                      phone: '+251 46 220 4410',
                      hours: 'Mon - Sat: 7:30 AM - 8:30 PM',
                    },
                    {
                      name: 'Amhara & Northwest Grain Corridor',
                      hub: 'Bahir Dar & Gondar Logistics Office',
                      phone: '+251 58 226 9100',
                      hours: 'Mon - Sat: 8:00 AM - 8:00 PM',
                    },
                    {
                      name: 'Tigray & Northern Ag-Exchange',
                      hub: 'Mekelle Central Terminal',
                      phone: '+251 34 440 8200',
                      hours: 'Mon - Sat: 8:00 AM - 7:00 PM',
                    },
                  ].map((desk, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{desk.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{desk.hub}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">{desk.hours}</p>
                      </div>
                      <a
                        href={`tel:${desk.phone.replace(/\s+/g, '')}`}
                        className="p-2.5 rounded-xl bg-zinc-100 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 border border-zinc-200 transition-colors"
                        title={`Call ${desk.name}`}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Callback Request */}
              <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-zinc-900">Request a Priority Callback</h4>
                </div>
                <p className="text-xs text-zinc-500">
                  Prefer an agent to call your phone number directly? Enter your phone number and we will connect within 10 minutes.
                </p>
                {callbackRequested ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Callback requested! An AgriLink officer will call you shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleRequestCallback} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="tel"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder="e.g. 0911 234 567"
                      className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                    >
                      Request Callback
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
