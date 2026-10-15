import { once } from "node:events";
import { createServer as createHttpServer } from "node:http";
import { createServer as createTcpServer, type AddressInfo, type Server } from "node:net";
import { Aedes } from "aedes";
import { WebSocketServer, createWebSocketStream } from "ws";

export type BrokerOptions = {
  tcpPort: number;
  websocketPort: number;
};

export type RunningBroker = {
  broker: Aedes;
  tcpPort: number;
  websocketPort: number;
  close: () => Promise<void>;
};

async function listen({ server, port }: { server: Server; port: number }): Promise<number> {
  server.listen(port);
  await once(server, "listening");
  return (server.address() as AddressInfo).port;
}

export async function startBroker({
  tcpPort,
  websocketPort,
}: BrokerOptions): Promise<RunningBroker> {
  const broker = await Aedes.createBroker();
  const tcpServer = createTcpServer(broker.handle);
  const httpServer = createHttpServer();

  new WebSocketServer({ server: httpServer }).on("connection", (socket, request) => {
    broker.handle(createWebSocketStream(socket), request);
  });

  const openTcpPort = await listen({ server: tcpServer, port: tcpPort });
  const openWebsocketPort = await listen({ server: httpServer, port: websocketPort });

  async function close() {
    tcpServer.close();
    httpServer.close();
    await new Promise<void>((resolve) => broker.close(() => resolve()));
  }

  return { broker, tcpPort: openTcpPort, websocketPort: openWebsocketPort, close };
}
