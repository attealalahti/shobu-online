import type { Server } from "http";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "../types/ws-types";
import { Server as SocketIOServer } from "socket.io";
import type {
  AllBoards,
  BoardState,
  DBGameState,
  GameState,
  IntRange,
  Player,
} from "../types/game-types";
import { dbGameStateSchema } from "../types/game-types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createStartingBoard = (): BoardState => {
  return [
    [
      { content: "white", x: 0, y: 0 },
      { content: "white", x: 1, y: 0 },
      { content: "white", x: 2, y: 0 },
      { content: "white", x: 3, y: 0 },
    ],
    [
      { content: "empty", x: 0, y: 1 },
      { content: "empty", x: 1, y: 1 },
      { content: "empty", x: 2, y: 1 },
      { content: "empty", x: 3, y: 1 },
    ],
    [
      { content: "empty", x: 0, y: 2 },
      { content: "empty", x: 1, y: 2 },
      { content: "empty", x: 2, y: 2 },
      { content: "empty", x: 3, y: 2 },
    ],
    [
      { content: "black", x: 0, y: 3 },
      { content: "black", x: 1, y: 3 },
      { content: "black", x: 2, y: 3 },
      { content: "black", x: 3, y: 3 },
    ],
  ];
};
const createStartingBoards = (): AllBoards => {
  return [
    createStartingBoard(),
    createStartingBoard(),
    createStartingBoard(),
    createStartingBoard(),
  ];
};
const gameStateToDBGameState = (gameState: GameState): DBGameState => {
  return {
    currentTurn: gameState.currentTurn,
    boards: gameState.boards.map((board) =>
      board.map((tiles) => tiles.map((tile) => tile.content))
    ),
  };
};

export default function ws(server: Server) {
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);
  const gameNameSpace = io.of(/\/*/);
  gameNameSpace.on("connect", (socket) => {
    console.log(`++ ${Date()} Connect ${socket.id} (${io.engine.clientsCount})`);
    socket.on("disconnect", (reason: string) => {
      console.log(
        `-- ${Date()} Disconnect ${socket.id} due to ${reason} (${
          io.engine.clientsCount
        })`
      );
    });
    socket.on("join", async (callback: (player: Player, game: GameState) => void) => {
      const namespace = socket.nsp.name.slice(1);
      const dbGame = await prisma.game.findFirst({
        where: { namespace },
      });
      if (dbGame) {
        try {
          const dbGameState: DBGameState = {
            currentTurn: dbGame.currentTurn,
            boards: dbGame.boards,
          } as DBGameState;
          dbGameStateSchema.parse(dbGameState);

          const player: Player = dbGame.blackPlayerExists
            ? dbGame.whitePlayerExists
              ? "spectator"
              : "white"
            : "black";
          if (player === "black") {
            await prisma.game.update({
              where: { namespace },
              data: { blackPlayerExists: true },
            });
          } else if (player === "white") {
            await prisma.game.update({
              where: { namespace },
              data: { whitePlayerExists: true },
            });
          }
          let boards = createStartingBoards();
          for (
            let boardIndex: IntRange = 0;
            boardIndex < 4;
            boardIndex = (boardIndex + 1) as IntRange
          ) {
            for (let y: IntRange = 0; y < 4; y = (y + 1) as IntRange) {
              for (let x: IntRange = 0; x < 4; x = (x + 1) as IntRange) {
                const currentBoard = dbGameState.boards[boardIndex];
                if (currentBoard) {
                  const currentTileColumn = currentBoard[y];
                  if (currentTileColumn) {
                    const currentTile = currentTileColumn[x];
                    if (currentTile) {
                      boards[boardIndex][y][x].content = currentTile;
                    }
                  }
                }
              }
            }
          }
          const game: GameState = {
            currentTurn: dbGameState.currentTurn,
            boards,
          };
          callback(player, game);
        } catch (zodError) {
          console.log(zodError);
        }
      } else {
        const player = Math.random() > 0.5 ? "black" : "white";
        const blackPlayerExists = player === "black";
        const whitePlayerExists = player === "white";
        const newGame: GameState = {
          currentTurn: "black",
          boards: createStartingBoards(),
        };
        const newDBGame = gameStateToDBGameState(newGame);
        await prisma.game.create({
          data: {
            namespace,
            currentTurn: newDBGame.currentTurn,
            boards: newDBGame.boards,
            blackPlayerExists,
            whitePlayerExists,
          },
        });
        callback(player, newGame);
      }
    });
  });
}
