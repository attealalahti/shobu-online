import type {
  AllBoards,
  BoardState,
  DbBoards,
  Tile,
  ZeroToThree,
  MoveVector,
} from "../types/game-types";

export const copyBoard = (board: BoardState): BoardState => {
  return [
    [
      { ...board[0][0] },
      { ...board[0][1] },
      { ...board[0][2] },
      { ...board[0][3] },
    ],
    [
      { ...board[1][0] },
      { ...board[1][1] },
      { ...board[1][2] },
      { ...board[1][3] },
    ],
    [
      { ...board[2][0] },
      { ...board[2][1] },
      { ...board[2][2] },
      { ...board[2][3] },
    ],
    [
      { ...board[3][0] },
      { ...board[3][1] },
      { ...board[3][2] },
      { ...board[3][3] },
    ],
  ];
};

export const copyAllBoards = (boards: AllBoards): AllBoards => {
  return [
    copyBoard(boards[0]),
    copyBoard(boards[1]),
    copyBoard(boards[2]),
    copyBoard(boards[3]),
  ];
};

export const equalBoards = (
  boards1: AllBoards | undefined,
  boards2: AllBoards | undefined
): boolean => {
  if (!boards1 || !boards2) return false;
  let result = true;
  for (
    let boardIndex: ZeroToThree = 0;
    boardIndex < 4 && result;
    boardIndex = (boardIndex + 1) as ZeroToThree
  ) {
    for (let y: ZeroToThree = 0; y < 4 && result; y = (y + 1) as ZeroToThree) {
      for (
        let x: ZeroToThree = 0;
        x < 4 && result;
        x = (x + 1) as ZeroToThree
      ) {
        result =
          boards1[boardIndex][y][x].content ===
          boards2[boardIndex][y][x].content;
      }
    }
  }
  return result;
};

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

export const createStartingBoards = (): AllBoards => {
  return [
    createStartingBoard(),
    createStartingBoard(),
    createStartingBoard(),
    createStartingBoard(),
  ];
};

export const formatBoardsForDb = (boards: AllBoards): DbBoards => {
  return boards.map((board) =>
    board.map((tiles) => tiles.map((tile) => tile.content))
  );
};

export const getTile = (
  currentX: ZeroToThree,
  currentY: ZeroToThree,
  vector: MoveVector,
  board: BoardState
): Tile | undefined => {
  const targetX = currentX + vector.x;
  const targetY = currentY + vector.y;
  const column = board[targetY];
  if (column) {
    const tile = column[targetX];
    if (tile) {
      return tile;
    }
  }
};

export const modifyVectorLength = (
  vector: MoveVector,
  amount: number
): MoveVector => {
  const getMultiplier = (value: number): number =>
    value > 0 ? 1 : value < 0 ? -1 : 0;
  const xMultiplier = getMultiplier(vector.x);
  const yMultiplier = getMultiplier(vector.y);
  const x = vector.x + amount * xMultiplier;
  const y = vector.y + amount * yMultiplier;
  const differentSigns = (a: number, b: number): boolean =>
    (a > 0 && b < 0) || (a < 0 && b > 0);
  return {
    x: differentSigns(x, xMultiplier) ? 0 : x,
    y: differentSigns(y, yMultiplier) ? 0 : y,
  };
};

export const getUpdatedBoards = (
  board: BoardState,
  boardIndex: ZeroToThree,
  allBoards: AllBoards
) => {
  const boards = copyAllBoards(allBoards);
  boards[boardIndex] = board;
  return boards;
};
