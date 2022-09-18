import type { Server } from "http";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "../types/ws-types";
import { Server as SocketIOServer } from "socket.io";
import { BoardState, Player } from "../types/game-types";

export default function ws(server: Server) {
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);
  const gameNameSpace = io.of(/\/[0-9]+/);
  gameNameSpace.on("connect", (socket) => {
    console.log(`++ ${Date()} Connect ${socket.id} (${io.engine.clientsCount})`);
    socket.on("disconnect", (reason: string) => {
      console.log(
        `-- ${Date()} Disconnect ${socket.id} due to ${reason} (${
          io.engine.clientsCount
        })`
      );
    });
    socket.on("join", async (callback: (player: Player) => void) => {
      const sockets = await socket.nsp.fetchSockets();
      if (sockets.length === 1) {
        const playerType = Math.random() > 0.5 ? "black" : "white";
        socket.data.player = playerType;
        callback(playerType);
      } else {
        const playerSockets = sockets.filter(
          (nspSocket) =>
            nspSocket.data.player &&
            nspSocket.data.player !== "spectator" &&
            nspSocket.id !== socket.id
        );
        let playerTypeToSend: Player | undefined = undefined;
        playerSockets.forEach((playerSocket) => {
          let newPlayerType: Player =
            playerSocket.data.player === "black" ? "white" : "black";
          if (playerTypeToSend && playerTypeToSend !== newPlayerType) {
            playerTypeToSend = "spectator";
          } else {
            playerTypeToSend = newPlayerType;
          }
        });
        if (playerTypeToSend) {
          socket.data.player = playerTypeToSend;
          callback(playerTypeToSend);
        } else {
          callback("spectator");
        }
      }
    });
  });
}
