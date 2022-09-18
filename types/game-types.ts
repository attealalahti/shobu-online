export type Player = "black" | "white" | "spectator";
export type Coordinate = 0 | 1 | 2 | 3;
export type Tile = {
  content: Player | "empty";
  selected?: boolean;
  possibleToMoveTo?: boolean;
  x: Coordinate;
  y: Coordinate;
};
export type BoardState = [
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile]
];
