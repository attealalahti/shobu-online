import { createRouter } from "./context";
import { z } from "zod";
import { v4 } from "uuid";
import type {
  AllBoards,
  Player,
  DbBoards,
  ZeroToThree,
} from "../../types/game-types";
import { dbBoardsSchema, playerEnum } from "../../types/game-types";
import {
  formatBoardsForDb,
  createStartingBoards,
} from "../../utils/game-utils";

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
            let boardIndex: ZeroToThree = 0;
            boardIndex < 4;
            boardIndex = (boardIndex + 1) as ZeroToThree
          ) {
            for (let y: ZeroToThree = 0; y < 4; y = (y + 1) as ZeroToThree) {
              for (let x: ZeroToThree = 0; x < 4; x = (x + 1) as ZeroToThree) {
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
