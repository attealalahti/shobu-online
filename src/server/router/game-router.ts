import { createRouter } from "./context";
import { z } from "zod";
import { v4 } from "uuid";
import type { AllBoards, Player, DbBoards } from "../../types/game-types";
import { dbBoardsSchema, playerEnum } from "../../types/game-types";
import {
  formatBoardsForDb,
  createStartingBoards,
  formatBoardsForClient,
} from "../../utils/game-utils";
import { TRPCError } from "@trpc/server";

export const gameRouter = createRouter()
  .query("id", {
    async resolve({ ctx }) {
      const player = await ctx.prisma.player.create({ data: { id: v4() } });
      return player.id;
    },
  })
  .query("data", {
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
          const dbBoards = game.boards as DbBoards;
          dbBoardsSchema.parse(dbBoards);
          playerEnum.parse(game.currentTurn);
          const boards = formatBoardsForClient(dbBoards);
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
  })
  .mutation("update", {
    input: z.object({
      gameId: z.string().nullish(),
      boards: dbBoardsSchema,
      currentTurn: playerEnum,
    }),
    async resolve({ input, ctx }) {
      if (input.gameId) {
        await ctx.prisma.game.update({
          where: { namespace: input.gameId },
          data: { boards: input.boards, currentTurn: input.currentTurn },
        });
        return true;
      } else {
        return false;
      }
    },
  })
  .mutation("newGame", {
    input: z.object({ gameId: z.string(), playerId: z.string().nullish() }),
    async resolve({ input, ctx }) {
      const game = await ctx.prisma.game.findFirst({
        where: { namespace: input.gameId },
      });
      if (!game) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No game found" });
      } else if (
        input.playerId !== game.black &&
        input.playerId !== game.white
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Id does not match player ids",
        });
      }
      const swapColors = Math.random() > 0.5;
      const newBoards = formatBoardsForDb(createStartingBoards());
      const newGame = await ctx.prisma.game.update({
        where: { namespace: input.gameId },
        data: {
          currentTurn: "black",
          boards: newBoards,
          black: swapColors ? game.white : game.black,
          white: swapColors ? game.black : game.white,
        },
      });
      try {
        dbBoardsSchema.parse(newGame.boards);
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: err });
      }
      const playerType: Player =
        newGame.black === input.playerId ? "black" : "white";
      return {
        playerType: playerType as Player,
        currentTurn: newGame.currentTurn as Player,
        boards: formatBoardsForClient(newGame.boards as DbBoards),
      };
    },
  });
