import type {
  AllBoards,
  BoardState,
  DbBoards,
  ZeroToThree,
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

/*
export const copyAllBoards = (boards: AllBoards): AllBoards => {
  return [
    copyBoard(boards[0]),
    copyBoard(boards[1]),
    copyBoard(boards[2]),
    copyBoard(boards[3]),
  ];
};
*/

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
