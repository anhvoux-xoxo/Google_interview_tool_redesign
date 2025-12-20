
import React, { useState, useEffect, useRef } from 'react';
import { Question, Recording } from '../types';
import { Mic, Video, Keyboard, Edit2, Info, ChevronDown, RotateCcw, Play, Pause, ArrowRight, ArrowLeft, Loader2, Lightbulb } from 'lucide-react';
import { playHoverSound } from '../utils/sound';
import { generateSpeech, transcribeAudio, getAiSuggestion } from '../services/geminiService';

interface QuestionFlowProps {
  question: Question;
  onComplete: (recording: Recording) => void;
  dontAskRedo: boolean;
  setDontAskRedo: (val: boolean) => void;
  sessionIndex?: number;
  sessionTotal?: number;
  onNext?: () => void;
  onPrev?: () => void;
}

type FlowState = 'READING' | 'INPUT_SELECTION' | 'RECORDING_VOICE' | 'PREVIEW_CAMERA' | 'RECORDING_CAMERA' | 'TYPING' | 'REVIEW';

async function decodePCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AudioVisualizer = ({ stream, isRecording = true }: { stream: MediaStream | null, isRecording?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    let animationId: number;
    let analyser: AnalyserNode | null = null;
    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    if (stream && isRecording) {
        try {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 64;
        } catch (e) {
            console.error("Audio context error", e);
        }
    }

    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        for(let i=0; i<bufferLength; i++) dataArray[i] = 0; 
      }
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = 4;
      const gap = 4;
      const totalBars = Math.floor(canvas.width / (barWidth + gap));
      const startX = (canvas.width - (totalBars * (barWidth + gap))) / 2;

      for(let i = 0; i < totalBars; i++) {
        const dataIndex = Math.floor(i * (bufferLength / totalBars));
        const value = dataArray[dataIndex] || 0;
        const percent = value / 255;
        const height = Math.max(4, percent * canvas.height);
        
        canvasCtx.fillStyle = '#C084FC';
        if (value > 10) {
            canvasCtx.fillStyle = '#A855F7';
        }

        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - height) / 2;
        
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, y, barWidth, height, 4);
        canvasCtx.fill();
      }
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationId);
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [stream, isRecording]);

  return <canvas ref={canvasRef} width={300} height={48} className="w-full h-full" />;
};

const PlaybackVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        let animationId: number;
        let step = 0;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = 4;
            const gap = 4;
            const totalBars = Math.floor(canvas.width / (barWidth + gap));
            const startX = (canvas.width - (totalBars * (barWidth + gap))) / 2;

            step += 0.1;

            for(let i=0; i<totalBars; i++) {
                let height = 10;
                if (isPlaying) {
                    height = 10 + Math.sin(i * 0.5 + step) * 10 + Math.random() * 10;
                } else {
                    height = 10 + Math.sin(i * 0.5) * 8;
                }
                
                ctx.fillStyle = '#C084FC';
                if (isPlaying) ctx.fillStyle = '#A855F7';

                const x = startX + i * (barWidth + gap);
                const y = (canvas.height - height) / 2;
                
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, height, 4);
                ctx.fill();
            }
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isPlaying]);

    return <canvas ref={canvasRef} width={300} height={48} className="w-full h-full" />;
}

export const QuestionFlow: React.FC<QuestionFlowProps> = ({ 
  question, 
  onComplete, 
  sessionIndex,
  sessionTotal,
  onNext,
  onPrev
}) => {
  const [flowState, setFlowState] = useState<FlowState>('READING');
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [voiceStream, setVoiceStream] = useState<MediaStream | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackIsPlaying, setPlaybackIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ttsAudioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: number;
    if ((flowState === 'RECORDING_VOICE' || flowState === 'RECORDING_CAMERA') && !isPaused) {
        interval = window.setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [flowState, isPaused]);

  useEffect(() => {
    return () => {
        if (playbackAudioRef.current) {
            playbackAudioRef.current.pause();
            playbackAudioRef.current = null;
        }
    };
  }, []);

  useEffect(() => {
    setFlowState('READING');
    setTranscript('');
    setSuggestion(null);
    setRecordedVideoUrl(null);
    setRecordedAudioUrl(null);
    setVoiceStream(null);
    setCameraStream(null);
    setRecordingDuration(0);
    setIsPaused(false);
    setIsTranscribing(false);

    let isMounted = true;

    const playQuestionAudio = async () => {
        const pcmData = await generateSpeech(question.text);
        if (!isMounted) return;

        if (pcmData) {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioContextClass({ sampleRate: 24000 });
                ttsAudioContextRef.current = ctx;
                const audioBuffer = await decodePCM(pcmData, ctx);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => {
                   if (isMounted) setFlowState(prev => prev === 'READING' ? 'INPUT_SELECTION' : prev);
                };
                ttsSourceRef.current = source;
                source.start();
            } catch (err) {
                fallbackSynthesis();
            }
        } else {
            fallbackSynthesis();
        }
    };
    
    const fallbackSynthesis = () => {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(question.text);
        utter.onend = () => {
           if (isMounted) setFlowState(prev => prev === 'READING' ? 'INPUT_SELECTION' : prev);
        };
        window.speechSynthesis.speak(utter);
    };
    
    const timer = setTimeout(() => {
        playQuestionAudio();
    }, 1000); // 1 second delay after clicking start/selecting card

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.speechSynthesis.cancel();
      if (ttsSourceRef.current) { try { ttsSourceRef.current.stop(); } catch(e) {} }
      if (ttsAudioContextRef.current && ttsAudioContextRef.current.state !== 'closed') ttsAudioContextRef.current.close();
      stopCamera();
    };
  }, [question]);

  const handleGetSuggestion = async () => {
    if (isLoadingSuggestion) return;
    setIsLoadingSuggestion(true);
    const res = await getAiSuggestion(question.text);
    setSuggestion(res);
    setIsLoadingSuggestion(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      console.error("Camera access failed", e);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (flowState === 'PREVIEW_CAMERA' || flowState === 'RECORDING_CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [flowState]);

  const startRecording = async (mode: 'video' | 'audio') => {
    try {
      let stream;
      if (mode === 'video') stream = cameraStream;
      else {
         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         setVoiceStream(stream);
      }
      if (!stream) return;
      chunksRef.current = [];
      setRecordingDuration(0);
      setIsPaused(false);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
         const mimeType = mode === 'video' ? 'video/webm' : 'audio/webm';
         const blob = new Blob(chunksRef.current, { type: mimeType });
         const url = URL.createObjectURL(blob);
         if (mode === 'video') setRecordedVideoUrl(url);
         else setRecordedAudioUrl(url);
         
         setIsTranscribing(true);
         const reader = new FileReader();
         reader.readAsDataURL(blob);
         reader.onloadend = async () => {
            const base64data = (reader.result as string).split(',')[1];
            const result = await transcribeAudio(base64data, mimeType);
            setTranscript(result);
            setIsTranscribing(false);
         };

         if (mode === 'audio') { stream.getTracks().forEach(t => t.stop()); setVoiceStream(null); }
      };
      mediaRecorder.start();
      if (mode === 'video') setFlowState('RECORDING_CAMERA');
      else { setTranscript(''); setFlowState('RECORDING_VOICE'); }
    } catch (e) { console.error("Recording start failed", e); }
  };

  const stopRecordingMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
       mediaRecorderRef.current.stop();
       setFlowState('REVIEW');
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
    } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
    }
  };

  const handlePlayPause = () => {
      if (!recordedAudioUrl) return;
      if (!playbackAudioRef.current) {
          playbackAudioRef.current = new Audio(recordedAudioUrl);
          playbackAudioRef.current.onended = () => setPlaybackIsPlaying(false);
      }
      if (playbackIsPlaying) {
          playbackAudioRef.current.pause();
          setPlaybackIsPlaying(false);
      } else {
          playbackAudioRef.current.play();
          setPlaybackIsPlaying(true);
      }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const headerClass = "text-2xl text-slate-800 leading-snug font-medium flex items-center";

  const ActionButton = ({ icon: Icon, onClick, active = false, className = "", large = false }: any) => {
     const sizeClass = large ? "w-16 h-16" : "w-14 h-14"; 
     const iconSize = large ? "w-8 h-8" : "w-6 h-6";
     return (
        <button
          onClick={onClick}
          onMouseEnter={playHoverSound}
          className={`
            ${sizeClass} rounded-2xl flex items-center justify-center transition-all duration-200
            ${active 
                ? 'bg-[#1B6FF3] text-white border-0' 
                : 'bg-white text-[#1B6FF3] border border-[#1B6FF3] hover:border-transparent hover:bg-[#1B6FF3]/15 hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]'
            }
            ${className}
          `}
        >
           <Icon className={iconSize} />
        </button>
     );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col min-h-[80vh]">
      
      {sessionIndex !== undefined && sessionTotal !== undefined && (
        <div className="mb-4 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <button 
                onClick={onPrev}
                disabled={sessionIndex === 1}
                className="p-2 rounded-full text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous question"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-slate-400 text-sm font-medium">Question {sessionIndex} of {sessionTotal}</span>
              <button 
                onClick={onNext}
                disabled={sessionIndex === sessionTotal}
                className="p-2 rounded-full text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next question"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
           </div>
           
           {flowState === 'REVIEW' && sessionIndex < sessionTotal && onNext && (
              <button 
                onClick={onNext}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-semibold"
              >
                Next question <ArrowRight className="w-4 h-4 ml-1" />
              </button>
           )}
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 mb-6 shadow-[0_10px_30px_rgba(90,85,120,0.15)] border border-slate-100">
        <span className={`
            inline-flex items-center px-2 py-1 rounded text-xs font-medium mb-4
            ${question.type === 'Background' ? 'bg-purple-100 text-purple-700' : 
              question.type === 'Custom question' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-700'}
        `}>
            <Info className="w-3 h-3 mr-1" />
            {question.type === 'Custom question' ? 'Custom question' : `${question.type} question`}
        </span>
        <h2 className="text-2xl text-slate-800 leading-snug">
          {question.text}
        </h2>
      </div>

      <div className="flex-grow">
        
        {flowState === 'READING' && (
          <div className="flex flex-col items-center pt-10">
            <div className="flex items-center space-x-2 text-slate-400 animate-pulse mb-8">
               <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
               <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
               <span className="text-sm font-medium text-slate-500">Reading question...</span>
            </div>
          </div>
        )}

        {flowState === 'INPUT_SELECTION' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(90,85,120,0.15)] animate-fade-in flex flex-col">
             <div className="mb-6"><h3 className={headerClass}>Your answer</h3></div>
             
             {suggestion && (
                <div className="mb-6 p-6 bg-amber-50 rounded-xl border border-amber-200 animate-fade-in">
                  <div className="flex items-center text-amber-800 font-semibold mb-2">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Key Points for your answer
                  </div>
                  <div className="text-amber-900 text-sm whitespace-pre-wrap leading-relaxed">
                    {suggestion}
                  </div>
                </div>
             )}

             {isLoadingSuggestion && (
               <div className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                  <span className="text-slate-600 font-medium">Getting key points...</span>
               </div>
             )}

             <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                    <ActionButton icon={Mic} onClick={() => startRecording('audio')} title="Voice" />
                    <ActionButton icon={Video} onClick={() => setFlowState('PREVIEW_CAMERA')} title="Camera" />
                    <ActionButton icon={Keyboard} onClick={() => setFlowState('TYPING')} title="Type" />
                </div>
                <button 
                  onClick={handleGetSuggestion}
                  onMouseEnter={playHoverSound}
                  disabled={isLoadingSuggestion}
                  className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
                    bg-amber-100 text-amber-600 border border-amber-200 hover:bg-amber-200
                    ${isLoadingSuggestion ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  title="Get key points"
                >
                  <Lightbulb className="w-6 h-6" />
                </button>
             </div>
          </div>
        )}

        {flowState === 'RECORDING_VOICE' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(90,85,120,0.15)] overflow-hidden">
             <div className="flex flex-col p-6 border-b border-slate-100">
                 <h3 className={`${headerClass} mb-6`}><div className="mr-3"><Mic className="w-6 h-6" /></div>Recording your answer</h3>
                 <div className="w-full bg-white border border-slate-200 rounded-full shadow-sm p-3 flex items-center justify-between">
                     <button onClick={togglePause} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPaused ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                        {isPaused ? <Mic className="w-6 h-6" /> : <Pause className="w-6 h-6 fill-current" />}
                    </button>
                     <div className="flex-grow mx-4 h-10">{voiceStream && <AudioVisualizer stream={voiceStream} isRecording={!isPaused} />}</div>
                     <div className="text-slate-900 font-mono font-medium min-w-[3rem] text-right">{formatTime(recordingDuration)}</div>
                 </div>
             </div>
             <div className="p-6"><button onClick={stopRecordingMedia} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-[20px] hover:bg-blue-700 transition-colors shadow-md text-lg">Done</button></div>
          </div>
        )}

        {(flowState === 'PREVIEW_CAMERA' || flowState === 'RECORDING_CAMERA') && (
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_10px_30px_rgba(90,85,120,0.15)]">
             <div className="aspect-[4/3] bg-black relative w-full">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" style={{ filter: 'brightness(1.05) contrast(1.02) saturate(1.05) blur(0.3px)' }} />
                {flowState === 'RECORDING_CAMERA' && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600/80 text-white px-3 py-1 rounded-full text-xs font-bold">
                     <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                     <span>REC {formatTime(recordingDuration)}</span>
                  </div>
                )}
             </div>
             <div className="p-6">{flowState === 'PREVIEW_CAMERA' ? (<button onClick={() => startRecording('video')} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-[20px] hover:bg-blue-700 shadow-md text-lg">Start</button>) : (<button onClick={stopRecordingMedia} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-[20px] hover:bg-blue-700 shadow-md text-lg">Done</button>)}</div>
          </div>
        )}

        {flowState === 'TYPING' && (
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(90,85,120,0.15)] flex flex-col min-h-[400px]">
              <h3 className={`${headerClass} mb-4`}><Keyboard className="w-8 h-8 mr-3" /> Your answer</h3>
              <div className="relative flex-grow group">
                <textarea 
                  ref={transcriptRef}
                  value={transcript} 
                  onChange={(e) => setTranscript(e.target.value)} 
                  className="w-full h-full min-h-[300px] resize-y border-none focus:ring-0 focus:outline-none text-lg text-black placeholder:text-slate-300 bg-white" 
                  placeholder="Type your answer here..." 
                  autoFocus 
                />
                <button 
                  onClick={() => transcriptRef.current?.focus()}
                  className="absolute bottom-3 right-8 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
              <div className="pt-4 border-t border-slate-100"><button onClick={() => setFlowState('REVIEW')} className="px-6 py-2 bg-blue-600 text-white rounded-[20px] font-medium hover:bg-blue-700">Done</button></div>
           </div>
        )}

        {flowState === 'REVIEW' && (
           <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(90,85,120,0.15)] overflow-hidden">
             {recordedVideoUrl && <div className="aspect-video bg-black w-full"><video src={recordedVideoUrl} controls className="w-full h-full" style={{ filter: 'brightness(1.05) contrast(1.02) saturate(1.05) blur(0.3px)' }} /></div>}
             
             <div className="flex items-center justify-between p-6 border-b border-slate-100">
               <div className="flex items-center cursor-pointer">
                 <div className="mr-3 text-slate-800"><ChevronDown className="w-6 h-6" /></div>
                 <span className={headerClass}>Your answer</span>
               </div>
             </div>

             {recordedAudioUrl && (<div className="px-6 pt-4"><div className="w-full bg-white border border-slate-200 rounded-full shadow-sm p-3 flex items-center justify-between"><button onClick={handlePlayPause} className="w-10 h-10 rounded-full border-2 border-[#1B6FF3] flex items-center justify-center text-[#1B6FF3] hover:bg-blue-50">{playbackIsPlaying ? (<Pause className="w-4 h-4 fill-current" />) : (<Play className="w-4 h-4 fill-current ml-0.5" />)}</button><div className="flex-grow mx-4 h-10"><PlaybackVisualizer isPlaying={playbackIsPlaying} /></div><div className="text-slate-900 font-mono font-medium min-w-[3rem] text-right">{formatTime(recordingDuration)}</div></div></div>)}
             
             <div className="p-6 border-b border-slate-100 relative bg-white transition-all duration-300">
                {isTranscribing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
                        <span className="text-slate-600 font-medium">Transcribing with high accuracy...</span>
                    </div>
                ) : (
                    <div className="relative group">
                      <textarea 
                          ref={transcriptRef}
                          value={transcript} 
                          onChange={(e) => setTranscript(e.target.value)} 
                          className="w-full h-full min-h-[120px] resize-y outline-none text-black text-lg leading-relaxed bg-white pr-12" 
                          placeholder="Your transcript will appear here..." 
                      />
                      <button 
                        onClick={() => transcriptRef.current?.focus()}
                        className="absolute bottom-3 right-8 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                )}
             </div>

             <div className="p-6">
                <h3 className="text-xl font-medium text-slate-800 mb-4">Redo</h3>
                <div className="flex space-x-4">
                   <ActionButton icon={Mic} onClick={() => startRecording('audio')} />
                   <ActionButton icon={Video} onClick={() => setFlowState('PREVIEW_CAMERA')} />
                   <ActionButton icon={Keyboard} onClick={() => setFlowState('TYPING')} />
                </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};
