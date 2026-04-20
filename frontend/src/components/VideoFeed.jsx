import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

export default function VideoFeed() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Function to start the video stream
    const startVideo = async () => {
      try {
        // Request the browser to use the default connected camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 } 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (err) {
        console.error("Error accessing the drone feed:", err);
        setError("NO SIGNAL: Please check RF Receiver connection and browser permissions.");
        setIsActive(false);
      }
    };

    startVideo();

    // Cleanup: Stop the camera when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
      
      {/* The Actual Video Feed */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Crosshair Overlay (For that FPV Drone feel) */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-1/2 h-1/2 border border-white rounded-full flex items-center justify-center">
             <div className="w-4 h-px bg-white"></div>
             <div className="h-4 w-px bg-white absolute"></div>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isActive && (
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] text-white font-mono uppercase tracking-widest font-bold">Live FPV</span>
        </div>
      )}

      {/* Error / No Signal State */}
      {!isActive && (
        <div className="absolute flex flex-col items-center text-slate-500 z-10">
          <CameraOff size={48} className="mb-4 opacity-50" />
          <p className="font-mono text-sm uppercase tracking-widest text-center px-8">
            {error || "INITIALIZING OPTICS..."}
          </p>
        </div>
      )}
      
      {/* Faux CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMSkiLz4KPC9zdmc+')] opacity-50 z-20"></div>
    </div>
  );
}