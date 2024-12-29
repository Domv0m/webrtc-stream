const net = require('net');
const WebSocket = require('ws');

class MinecraftProxy {
    constructor(port = 19132) {
        this.port = port;
        this.tunnels = new Map();
        this.server = net.createServer();
    }

    start() {
        this.server.listen(this.port, '0.0.0.0', () => {
            console.log(`Minecraft Proxy Server started on port ${this.port}`);
        });

        this.server.on('connection', (clientSocket) => {
            console.log('New Minecraft connection');
            this.handleMinecraftConnection(clientSocket);
        });
    }

    handleMinecraftConnection(clientSocket) {
        const tunnel = Array.from(this.tunnels.values())[0];
        
        if (tunnel) {
            // Отправка информации о новом подключении
            tunnel.send(JSON.stringify({
                type: 'minecraft-connection',
                clientInfo: {
                    address: clientSocket.remoteAddress,
                    port: clientSocket.remotePort
                }
            }));

            // Временная приостановка клиентского сокета
            clientSocket.pause();

            // Создание обработчиков данных
            const dataHandler = (message) => {
                const data = JSON.parse(message);
                
                if (data.type === 'tunnel-ready') {
                    // Возобновление и пересылка данных
                    clientSocket.resume();
                    
                    clientSocket.on('data', (chunk) => {
                        tunnel.send(JSON.stringify({
                            type: 'minecraft-data',
                            data: chunk.toString('base64')
                        }));
                    });

                    tunnel.on('message', (message) => {
                        const data = JSON.parse(message);
                        if (data.type === 'minecraft-response') {
                            clientSocket.write(Buffer.from(data.data, 'base64'));
                        }
                    });
                }
            };

            tunnel.on('message', dataHandler);
        } else {
            console.log('No active tunnel');
            clientSocket.destroy();
        }
    }

    registerTunnel(tunnel) {
        const tunnelId = Date.now().toString();
        this.tunnels.set(tunnelId, tunnel);
        return tunnelId;
    }
}

const proxy = new MinecraftProxy();
proxy.start();
