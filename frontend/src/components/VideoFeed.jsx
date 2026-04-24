import React, { useEffect, useRef, useState } from 'react';
import { CameraOff, Wifi, RadioReceiver, Settings } from 'lucide-react';

export default function VideoFeed() {
  const videoRef = useRef(null);
  const [feedMode, setFeedMode] = useState('rf'); 
  const [ipUrl, setIpUrl] = useState('http://172.20.10.2:5000/');
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  const startRFStream = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError("NO RF SIGNAL: Check USB Receiver.");
      setIsActive(false);
    }
  };

  const stopRFStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // THE FIX: Immediately set active when switching to Wi-Fi mode
  useEffect(() => {
    if (feedMode === 'rf') {
      startRFStream();
    } else {
      stopRFStream();
      setError(null);
      setIsActive(true); // Force the UI overlays to show
    }
    return () => stopRFStream();
  }, [feedMode, ipUrl]);

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group">
      
      {/* Mode 1: RF Feed */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${feedMode === 'rf' && isActive ? 'opacity-100 z-10' : 'opacity-0 z-[-1]'}`}
      />

      {/* Mode 2: Wi-Fi Feed (THE FIX: Removed onLoad dependency) */}
      {feedMode === 'wifi' && (
        <img 
          src={ipUrl} 
          alt="Wi-Fi IP Stream"
          onError={() => { setIsActive(false); setError("CONNECTION REFUSED"); }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${isActive ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* HUD Overlays */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 z-20">
          <div className="w-1/2 h-1/2 border border-white rounded-full flex items-center justify-center">
             <div className="w-4 h-px bg-white"></div>
             <div className="h-4 w-px bg-white absolute"></div>
          </div>
        </div>
      )}

      {isActive && (
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-30">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] text-white font-mono uppercase tracking-widest font-bold">
            Live {feedMode === 'rf' ? 'Analog RF' : 'Wi-Fi IP'}
          </span>
        </div>
      )}

      {!isActive && (
        <div className="absolute flex flex-col items-center text-slate-500 z-10">
          <CameraOff size={48} className="mb-4 opacity-50" />
          <p className="font-mono text-sm uppercase tracking-widest text-center px-8">
            {error || "AWAITING VIDEO LINK..."}
          </p>
        </div>
      )}

      {/* Tactical Configuration Menu */}
      <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2">
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all shadow-lg"
        >
          <Settings size={20} />
        </button>

        {showConfig && (
          <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-700 shadow-2xl w-64">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Video Matrix</p>
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setFeedMode('rf')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${feedMode === 'rf' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-500 border border-transparent'}`}
              >
                <RadioReceiver size={14} /> RF
              </button>
              <button 
                onClick={() => setFeedMode('wifi')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${feedMode === 'wifi' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-800 text-slate-500 border border-transparent'}`}
              >
                <Wifi size={14} /> IP
              </button>
            </div>

            {feedMode === 'wifi' && (
              <div className="space-y-2">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Pi URL</label>
                <input 
                  type="text" 
                  value={ipUrl}
                  onChange={(e) => setIpUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-blue-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMSkiLz4KPC9zdmc+')] opacity-50 z-20"></div>
    </div>
  );
}