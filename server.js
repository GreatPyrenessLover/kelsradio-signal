const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

let broadcaster = null;

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'broadcaster') {
            broadcaster = ws;
        }

        if (data.type === 'watcher' && broadcaster) {
            broadcaster.send(JSON.stringify({ type: 'watcher' }));
        }

        if (data.type === 'offer') {
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'offer', offer: data.offer }));
                }
            });
        }

        if (data.type === 'answer') {
            broadcaster.send(JSON.stringify({ type: 'answer', answer: data.answer }));
        }

        if (data.type === 'candidate') {
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'candidate', candidate: data.candidate }));
                }
            });
        }
    });

    ws.on('close', () => {
        if (ws === broadcaster) broadcaster = null;
    });
});
