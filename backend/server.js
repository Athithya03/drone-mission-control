const dgram = require('dgram');
const WebSocket = require('ws');
const { MavLinkPacketSplitter, MavLinkPacketParser } = require('node-mavlink');

// 1. Setup WebSocket Server for the React Frontend
const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket server running on ws://localhost:8080");

// 2. Setup UDP Client to listen to Mission Planner
const udpClient = dgram.createSocket('udp4');
udpClient.bind(14550, '127.0.0.1');

// 3. Setup MAVLink parsing pipeline
const splitter = new MavLinkPacketSplitter();
const parser = new MavLinkPacketParser();

splitter.pipe(parser);

parser.on('data', (packet) => {
    let telemetryData = {};

    try {
        const payload = packet.payload;

        // ID 33: GLOBAL_POSITION_INT (GPS Coordinates)
        if (packet.header.msgid === 33 && payload.length >= 12) {
            telemetryData.lat = payload.readInt32LE(4) / 1e7; // Latitude starts at byte 4
            telemetryData.lon = payload.readInt32LE(8) / 1e7; // Longitude starts at byte 8
        }
        
        // ID 74: VFR_HUD (Barometer Altitude & Ground Speed for Desk Testing)
        if (packet.header.msgid === 74 && payload.length >= 16) {
            telemetryData.speed = payload.readFloatLE(4); // Groundspeed starts at byte 4
            telemetryData.alt = payload.readFloatLE(12);  // Barometer Alt starts at byte 12
        }
        
        // ID 1: SYS_STATUS (Power Plant Diagnostics)
        if (packet.header.msgid === 1 && payload.length >= 19) {
            telemetryData.voltage = payload.readUInt16LE(14) / 1000; // Voltage at byte 14
            telemetryData.battery = payload.readInt8(18);            // Battery % at byte 18
        }

        // ID 0: HEARTBEAT (System Status & Flight Mode)
        if (packet.header.msgid === 0 && payload.length >= 8) {
            const systemStatus = payload.readUInt8(7);
            const customMode = payload.readUInt32LE(0);
            
            telemetryData.status = systemStatus === 4 ? 'ACTIVE' : 'STANDBY';
            
            // Map common ArduCopter modes (Expand as needed)
            const modes = { 0: 'STABILIZE', 4: 'GUIDED', 5: 'LOITER', 6: 'RTL', 9: 'LAND' };
            if (modes[customMode]) {
                 telemetryData.mode = modes[customMode];
            }
        }

    } catch (err) {
        // Silently catch payload reading errors caused by MAVLink V2 truncation
        // This ensures the backend bridge never crashes during flight
        console.warn("Skipped malformed packet ID:", packet.header.msgid);
    }

    // 4. Broadcast to all connected web clients
    if (Object.keys(telemetryData).length > 0) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(telemetryData));
            }
        });
    }
});

udpClient.on('message', (msg) => splitter.write(msg));
udpClient.on('listening', () => console.log('Listening for Mission Planner UDP on port 14550'));