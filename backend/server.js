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

    // Parse Global Position (ID 33)
    if (packet.header.msgid === 33) {
        telemetryData = {
            lat: packet.payload.readInt32LE(0) / 1e7,
            lon: packet.payload.readInt32LE(4) / 1e7,
            alt: packet.payload.readInt32LE(8) / 1000,
            speed: Math.sqrt(
                Math.pow(packet.payload.readInt16LE(14), 2) + 
                Math.pow(packet.payload.readInt16LE(16), 2)
            ) / 100 // Calculate 2D ground speed from vx and vy
        };
    }
    
    // Parse System Status / Battery (ID 1)
    if (packet.header.msgid === 1) {
        telemetryData = {
            battery: packet.payload.readInt8(14),
            voltage: packet.payload.readUInt16LE(10) / 1000
        };
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