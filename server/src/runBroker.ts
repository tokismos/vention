import { startBroker } from "@/broker";

const TCP_PORT = 1883;
const WEBSOCKET_PORT = 8888;

const { broker, tcpPort, websocketPort } = await startBroker({
  tcpPort: TCP_PORT,
  websocketPort: WEBSOCKET_PORT,
});

broker.on("client", (client) => console.log(`${client.id} connected`));
broker.on("clientDisconnect", (client) => console.log(`${client.id} disconnected`));

console.log(`MQTT on mqtt://localhost:${tcpPort}`);
console.log(`MQTT over WebSocket on ws://localhost:${websocketPort}`);
