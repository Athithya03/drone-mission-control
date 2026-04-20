import React, { useState, useEffect } from 'react';
import { Battery, Activity, Zap, MapPin, Signal, Radio, Navigation } from 'lucide-react';
import TelemetryMap from './TelemetryMap';
import VideoFeed from './VideoFeed'; // <-- 1. Import the Video Feed

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState({
    status: 'STANDBY',
    mode: 'STABILIZE',
    battery: 0,
    voltage: 0.0,
    alt: 0.0,
    speed: 0.0,
    lat: 0, 
    lon: 0,
    signal: 100
  });

  // ... (Keep your existing WebSocket useEffect here) ...

  const getBatteryColor = (level) => {
    if (level > 50) return 'text-emerald-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-500';
  };

  const headerStyle = {
    // Your original beautiful fading gradient
    backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 30%, rgba(15, 23, 42, 0) 70%), url('https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=2000')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center 35%', 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 md:px-8 py-8 font-sans w-full overflow-x-hidden">
      
      {/* 1. RESTORED CINEMATIC HERO HEADER */}
      <header 
        style={headerStyle} 
        className="relative overflow-hidden rounded-[2.5rem] px-12 py-48 mb-10 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
                <Radio className="text-white" size={28} />
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
                Mission Control
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] uppercase font-bold">
                Live Telemetry Link Active
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-900/80 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/10 shadow-2xl">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Status</p>
               <p className="text-emerald-400 font-bold text-xl tracking-tight">{telemetry.status}</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/10 shadow-2xl">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Mode</p>
               <p className="text-blue-400 font-bold text-xl tracking-tight">{telemetry.mode}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. NEW DEDICATED FPV VIDEO SECTION */}
      {/* We give it a massive 500px height so the optics are crystal clear */}
      <div className="mb-10 w-full h-[500px] bg-slate-900 rounded-[2.5rem] p-2 border border-slate-800 shadow-2xl relative">
        {/* Decorative corner accents for that military/industrial feel */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-slate-500 z-10 pointer-events-none rounded-tl-lg"></div>
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-slate-500 z-10 pointer-events-none rounded-tr-lg"></div>
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-slate-500 z-10 pointer-events-none rounded-bl-lg"></div>
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-slate-500 z-10 pointer-events-none rounded-br-lg"></div>
        
        <VideoFeed />
      </div>

      {/* 3. GRID DATA SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        {/* Power Card */}
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-800 flex flex-col justify-between group hover:border-slate-600 transition-all">
          <div className="flex justify-between items-start">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Power Plant</h2>
            <Battery className={`${getBatteryColor(telemetry.battery)} group-hover:scale-110 transition-transform`} size={24} />
          </div>
          <div className="my-6">
            <span className={`text-6xl font-black tracking-tighter ${getBatteryColor(telemetry.battery)}`}>
              {telemetry.battery}%
            </span>
            <p className="text-slate-400 mt-2 font-mono text-sm">{telemetry.voltage.toFixed(1)}V System Output</p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${telemetry.battery > 20 ? 'bg-emerald-400' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`} 
              style={{ width: `${telemetry.battery}%` }}
            ></div>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-800 lg:col-span-2 grid grid-cols-2 gap-8">
          <div className="flex flex-col justify-center border-r border-slate-800 pr-4">
            <div className="flex items-center gap-3 text-slate-500 mb-4 uppercase tracking-widest text-[10px] font-bold">
              <Activity size={18} className="text-blue-400" />
              <span>Altitude (REL)</span>
            </div>
            <span className="text-6xl font-black text-white tracking-tighter">
              {telemetry.alt.toFixed(1)} <span className="text-2xl text-slate-600 italic">M</span>
            </span>
          </div>
          
          <div className="flex flex-col justify-center pl-4">
            <div className="flex items-center gap-3 text-slate-500 mb-4 uppercase tracking-widest text-[10px] font-bold">
              <Navigation size={18} className="text-purple-400" />
              <span>Ground Speed</span>
            </div>
            <span className="text-6xl font-black text-white tracking-tighter">
              {telemetry.speed.toFixed(1)} <span className="text-2xl text-slate-600 italic">M/S</span>
            </span>
          </div>
        </div>

        {/* Link Quality */}
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Data Link</h2>
            <Signal className="text-blue-400" size={24} />
          </div>
          <div className="mt-4">
            <span className="text-6xl font-black text-white tracking-tighter">{telemetry.signal}%</span>
            <p className="text-slate-500 mt-2 font-mono text-[10px] uppercase tracking-widest">Channel: UDP 14550</p>
          </div>
        </div>

        {/* FULL WIDTH MAP */}
        <div className="bg-slate-900 p-3 rounded-[2.5rem] shadow-2xl border border-slate-800 md:col-span-3 lg:col-span-4 h-[600px] relative overflow-hidden">
          {/* Coordinates floating on the RIGHT */}
          <div className="absolute top-8 right-8 z-20 bg-slate-950/90 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-2xl pointer-events-none min-w-[200px]">
             <div className="flex items-center gap-4">
                <div className="bg-red-500/20 p-3 rounded-xl">
                  <MapPin size={20} className="text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Position Fix</p>
                  <p className="text-white font-mono font-bold text-sm">
                    {telemetry.lat.toFixed(5)} N<br/>
                    {telemetry.lon.toFixed(5)} E
                  </p>
                </div>
             </div>
          </div>
          
          <div className="w-full h-full rounded-[2rem] overflow-hidden">
             <TelemetryMap lat={telemetry.lat} lon={telemetry.lon} />
          </div>
        </div>

      </div>
      
      <footer className="mt-12 text-center">
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.5em] font-bold">
          
        </p>
      </footer>
    </div>
  );
}