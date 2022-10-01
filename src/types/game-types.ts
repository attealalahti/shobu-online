import z from "zod";
export const playerEnum = z.enum(["black", "white", "spectator"]);
export type Player = z.infer<typeof playerEnum>;
export type IntRange = 0 | 1 | 2 | 3;
export type Tile = {
  content: Player | "empty";
  selected?: boolean;
  possibleToMoveTo?: boolean;
  x: IntRange;
  y: IntRange;
};
export type BoardState = [
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile]
];

export type AllBoards = [BoardState, BoardState, BoardState, BoardState];

export type GameState = {
  currentTurn: Player;
  boards: AllBoards;
};

export const dbBoardsSchema = z
  .array(
    z
      .array(
        z.array(z.enum(["black", "white", "spectator", "empty"])).length(4)
      )
      .length(4)
  )
  .length(4);

export type DbBoards = z.infer<typeof dbBoardsSchema>;

export type StoneCoordinates = {
  x: IntRange;
  y: IntRange;
  boardIndex: IntRange;
};