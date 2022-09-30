import { createRouter } from "./context";
import { z } from "zod";
import { v4 } from "uuid";
import {
  AllBoards,
  Player,
  DbBoards,
  BoardState,
  IntRange,
  dbBoardsSchema,
  playerEnum,
} from "../../types/game-types";

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
const formatBoardsForDb = (boards: AllBoards): DbBoards => {
  return boards.map((board) =>
    board.map((tiles) => tiles.map((tile) => tile.content))
  );
};

export const gameRouter = createRouter()
  .query("id", {
    async resolve({ ctx }) {
      const player = await ctx.prisma.player.create({ data: { id: v4() } });
      return player.id;
    },
  })
  .query("join", {
    input: z.object({ playerId: z.string(), gameId: z.string() }).nullish(),
    async resolve({
      input,
      ctx,
    }): Promise<
      { playerType: Player; currentTurn: Player; boards: AllBoards } | undefined
    > {
      if (!input) return undefined;
      let game = await ctx.prisma.game.findFirst({
        where: { namespace: input.gameId },
      });
      if (!game) {
        const boards = formatBoardsForDb(createStartingBoards());
        game = await ctx.prisma.game.create({
          data: {
            namespace: input.gameId,
            currentTurn: "black",
            boards,
          },
        });
      }
      if (game) {
        let playerType: Player;
        if (game.black === input.playerId) {
          playerType = "black";
        } else if (game.white === input.playerId) {
          playerType = "white";
        } else {
          if (!game.black && !game.white) {
            playerType = Math.random() > 0.5 ? "black" : "white";
          } else if (!game.black) {
            playerType = "black";
          } else if (!game.white) {
            playerType = "white";
          } else {
            playerType = "spectator";
          }
          if (playerType === "black") {
            await ctx.prisma.game.update({
              where: { namespace: input.gameId },
              data: { black: input.playerId },
            });
          } else if (playerType === "white") {
            await ctx.prisma.game.update({
              where: { namespace: input.gameId },
              data: { white: input.playerId },
            });
          }
        }
        try {
          const boards = createStartingBoards();
          const dbBoards = game.boards as DbBoards;
          dbBoardsSchema.parse(dbBoards);
          playerEnum.parse(game.currentTurn);
          for (
            let boardIndex: IntRange = 0;
            boardIndex < 4;
            boardIndex = (boardIndex + 1) as IntRange
          ) {
            for (let y: IntRange = 0; y < 4; y = (y + 1) as IntRange) {
              for (let x: IntRange = 0; x < 4; x = (x + 1) as IntRange) {
                const currentBoard = dbBoards[boardIndex];
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
          return {
            playerType,
            currentTurn: game.currentTurn as Player,
            boards,
          };
        } catch (err) {
          console.log(err);
        }
      }
      return undefined;
    },
  });
