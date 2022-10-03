import z from "zod";
export const playerEnum = z.enum(["black", "white", "spectator"]);
export type Player = z.infer<typeof playerEnum>;
export type ZeroToThree = 0 | 1 | 2 | 3;
export type Tile = {
  content: Player | "empty";
  selected?: boolean;
  passiveMoveTarget?: boolean;
  canMakeAggressiveMove?: boolean;
  x: ZeroToThree;
  y: ZeroToThree;
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
  x: ZeroToThree;
  y: ZeroToThree;
  boardIndex: ZeroToThree;
};

export type Move = "passive" | "aggressive";

export type BoardType = "home" | "enemy";

export type BoardColor = "dark" | "light";

export type MoveVector = { x: number; y: number };
