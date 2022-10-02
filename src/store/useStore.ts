import create from "zustand";
import type {
  AllBoards,
  BoardState,
  BoardColor,
  ZeroToThree,
  Move,
  MoveVector,
  Player,
  StoneCoordinates,
} from "../types/game-types";
import {
  getUpdatedBoards,
  copyBoard,
  equalBoards,
  getTile,
  modifyVectorLength,
} from "../utils/game-utils";

interface State {
  playerType: Player | undefined;
  boards: AllBoards | undefined;
  currentTurn: Player | undefined;
  selectedStone: StoneCoordinates | undefined;
  moveType: Move;
  passiveMoveBoardColor: BoardColor | undefined;
  moveVector: MoveVector | undefined;
  clearGameData: () => void;
  setGameData: (
    data:
      | { boards: AllBoards; currentTurn: Player; playerType: Player }
      | undefined
  ) => void;
  selectPassiveMoveStone: (
    x: ZeroToThree,
    y: ZeroToThree,
    boardIndex: ZeroToThree
  ) => void;
  makePassiveMove: (
    x: ZeroToThree,
    y: ZeroToThree,
    boardIndex: ZeroToThree,
    boardColor: BoardColor
  ) => void;
  makeAggressiveMove: (
    x: ZeroToThree,
    y: ZeroToThree,
    boardIndex: ZeroToThree
  ) => void;
}

const useStore = create<State>()((set) => ({
  playerType: undefined,
  boards: undefined,
  currentTurn: undefined,
  selectedStone: undefined,
  moveType: "passive",
  passiveMoveBoardColor: undefined,
  moveVector: undefined,
  clearGameData: () =>
    set(() => ({
      playerType: undefined,
      boards: undefined,
      currentTurn: undefined,
      selectedStone: undefined,
      moveType: "passive",
      passiveMoveBoardColor: undefined,
      moveVector: undefined,
    })),
  setGameData: (data) =>
    set((state) => {
      if (
        !equalBoards(data?.boards, state.boards) ||
        data?.currentTurn !== state.currentTurn ||
        data?.playerType !== state.playerType
      ) {
        return {
          boards: data?.boards,
          currentTurn: data?.currentTurn,
          playerType: data?.playerType,
        };
      }
      return {};
    }),
  selectPassiveMoveStone: (x, y, boardIndex) =>
    set((state) => {
      if (!state.boards) return {};
      const newBoard = copyBoard(state.boards[boardIndex]);
      newBoard[y][x].selected = !newBoard[y][x].selected;
      if (newBoard[y][x].selected) {
        let up1: ZeroToThree | undefined;
        let up2: ZeroToThree | undefined;
        let right1: ZeroToThree | undefined;
        let right2: ZeroToThree | undefined;
        let down1: ZeroToThree | undefined;
        let down2: ZeroToThree | undefined;
        let left1: ZeroToThree | undefined;
        let left2: ZeroToThree | undefined;
        if (y - 1 >= 0) {
          up1 = (y - 1) as ZeroToThree;
          if (y - 2 >= 0) {
            up2 = (y - 2) as ZeroToThree;
          }
        }
        if (x + 1 < 4) {
          right1 = (x + 1) as ZeroToThree;
          if (x + 2 < 4) {
            right2 = (x + 2) as ZeroToThree;
          }
        }
        if (y + 1 < 4) {
          down1 = (y + 1) as ZeroToThree;
          if (y + 2 < 4) {
            down2 = (y + 2) as ZeroToThree;
          }
        }
        if (x - 1 >= 0) {
          left1 = (x - 1) as ZeroToThree;
          if (x - 2 >= 0) {
            left2 = (x - 2) as ZeroToThree;
          }
        }
        if (up1 !== undefined) {
          if (newBoard[up1][x].content === "empty") {
            newBoard[up1][x].passiveMoveTarget = true;
            if (up2 !== undefined && newBoard[up2][x].content === "empty") {
              newBoard[up2][x].passiveMoveTarget = true;
            }
          }
          if (
            right1 !== undefined &&
            newBoard[up1][right1].content === "empty"
          ) {
            newBoard[up1][right1].passiveMoveTarget = true;
            if (
              up2 !== undefined &&
              right2 !== undefined &&
              newBoard[up2][right2].content === "empty"
            ) {
              newBoard[up2][right2].passiveMoveTarget = true;
            }
          }
          if (left1 !== undefined && newBoard[up1][left1].content === "empty") {
            newBoard[up1][left1].passiveMoveTarget = true;
            if (
              up2 !== undefined &&
              left2 !== undefined &&
              newBoard[up2][left2].content === "empty"
            ) {
              newBoard[up2][left2].passiveMoveTarget = true;
            }
          }
        }
        if (down1 !== undefined) {
          if (
            right1 !== undefined &&
            newBoard[down1][right1].content === "empty"
          ) {
            newBoard[down1][right1].passiveMoveTarget = true;
            if (
              down2 !== undefined &&
              right2 !== undefined &&
              newBoard[down2][right2].content === "empty"
            ) {
              newBoard[down2][right2].passiveMoveTarget = true;
            }
          }
          if (newBoard[down1][x].content === "empty") {
            newBoard[down1][x].passiveMoveTarget = true;
            if (down2 !== undefined && newBoard[down2][x].content === "empty") {
              newBoard[down2][x].passiveMoveTarget = true;
            }
          }
          if (
            left1 !== undefined &&
            newBoard[down1][left1].content === "empty"
          ) {
            newBoard[down1][left1].passiveMoveTarget = true;
            if (
              down2 !== undefined &&
              left2 !== undefined &&
              newBoard[down2][left2].content === "empty"
            ) {
              newBoard[down2][left2].passiveMoveTarget = true;
            }
          }
        }
        if (right1 !== undefined && newBoard[y][right1].content === "empty") {
          newBoard[y][right1].passiveMoveTarget = true;
          if (right2 !== undefined && newBoard[y][right2].content === "empty") {
            newBoard[y][right2].passiveMoveTarget = true;
          }
        }
        if (left1 !== undefined && newBoard[y][left1].content === "empty") {
          newBoard[y][left1].passiveMoveTarget = true;
          if (left2 !== undefined && newBoard[y][left2].content === "empty") {
            newBoard[y][left2].passiveMoveTarget = true;
          }
        }
      } else {
        clearMoveTargets(newBoard);
      }
      return {
        selectedStone: newBoard[y][x].selected
          ? { x, y, boardIndex }
          : undefined,
        boards: getUpdatedBoards(newBoard, boardIndex, state.boards),
      };
    }),
  makePassiveMove: (x, y, boardIndex, boardColor) =>
    set(({ selectedStone, playerType, boards }) => {
      if (!selectedStone || !playerType || !boards) return {};
      const xDelta = x - selectedStone.x;
      const yDelta = y - selectedStone.y;
      if (xDelta < -2 || xDelta > 2 || yDelta < -2 || yDelta > 2) return {};
      const moveVector: MoveVector = { x: xDelta, y: yDelta };
      const newBoard = copyBoard(boards[boardIndex]);
      newBoard[y][x].content = playerType;
      clearMoveTargets(newBoard);
      newBoard[selectedStone.y][selectedStone.x].content = "empty";
      newBoard[selectedStone.y][selectedStone.x].selected = false;
      return {
        selectedStone: undefined,
        boards: getUpdatedBoards(newBoard, boardIndex, boards),
        moveType: "aggressive",
        passiveMoveBoardColor: boardColor,
        moveVector,
      };
    }),
  makeAggressiveMove: (x, y, boardIndex) =>
    set(({ moveVector, boards, playerType, currentTurn }) => {
      if (!moveVector || !boards || !playerType || !currentTurn) return {};
      const board = boards[boardIndex];
      const dest = getTile(x, y, moveVector, board);
      if (!dest) return {};
      const newBoard = copyBoard(board);
      const destinationContent = dest.content;
      newBoard[y][x].content = "empty";
      newBoard[dest.y][dest.x].content = playerType;
      const afterDestVector = modifyVectorLength(moveVector, 1);
      const afterDest = getTile(x, y, afterDestVector, board);
      if (afterDest?.content === "empty") {
        newBoard[afterDest.y][afterDest.x].content = destinationContent;
      }
      return {
        boards: getUpdatedBoards(newBoard, boardIndex, boards),
        currentTurn:
          currentTurn === "black"
            ? "white"
            : currentTurn === "white"
            ? "black"
            : currentTurn,
        moveType: "passive",
        passiveMoveBoardColor: undefined,
        moveVector: undefined,
      };
    }),
}));

const clearMoveTargets = (board: BoardState) => {
  for (let i: ZeroToThree = 0; i < 4; i = (i + 1) as ZeroToThree) {
    for (let j: ZeroToThree = 0; j < 4; j = (j + 1) as ZeroToThree) {
      board[i][j].passiveMoveTarget = false;
    }
  }
};

export default useStore;
