export type Player = "black" | "white" | "spectator";
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
