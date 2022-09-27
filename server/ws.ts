import type { Server } from "http";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "../types/ws-types";
import { Server as SocketIOServer } from "socket.io";

export default function ws(server: Server) {
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);
  const gameNameSpace = io.of(/\/*/);
  gameNameSpace.on("connect", (socket) => {
    console.log(
      `++ ${Date()} Connect ${socket.id} (${io.engine.clientsCount})`
    );
    socket.on("disconnect", (reason: string) => {
      console.log(
        `-- ${Date()} Disconnect ${socket.id} due to ${reason} (${
          io.engine.clientsCount
        })`
      );
    });
  });
}
