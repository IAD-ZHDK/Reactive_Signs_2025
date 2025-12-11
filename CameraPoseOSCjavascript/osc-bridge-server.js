// OSC WebSocket Bridge Server
// This server allows browser-based OSC clients to communicate via WebSocket
// and bridges to UDP OSC for other applications if needed

const WebSocket = require('ws');
const osc = require('osc');

const WS_PORT = 8025;

// Create WebSocket Server
const wss = new WebSocket.Server({
    port: WS_PORT,
    perMessageDeflate: false
});

console.log(`OSC WebSocket Bridge Server running on ws://localhost:${WS_PORT}`);

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);

    // Create OSC port for this connection
    const oscPort = new osc.WebSocketPort({
        socket: ws,
        metadata: true
    });

    // Forward OSC messages to all other connected clients
    oscPort.on('message', (oscMsg) => {
        console.log('Received OSC:', oscMsg.address, oscMsg.args);

        // Broadcast to all other clients
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                try {
                    client.send(JSON.stringify(oscMsg));
                } catch (e) {
                    console.error('Error broadcasting:', e);
                }
            }
        });
    });

    oscPort.on('error', (error) => {
        console.error('OSC Port error:', error);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

console.log('Waiting for connections...');
console.log('Press Ctrl+C to stop');
