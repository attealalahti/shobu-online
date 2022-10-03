import create from "zustand";
import type {
  AllBoards,
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
  areBoardsEqual,
  getTile,
  modifyVectorLength,
  clearMoveTargets,
} from "../utils/game-utils";

interface State {
  playerType: Player | undefined;
  boards: AllBoards | undefined;
  boardsBeforePassiveMove: AllBoards | undefined;
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
  undoPassiveMove: () => void;
  makeAggressiveMove: (
    x: ZeroToThree,
    y: ZeroToThree,
    boardIndex: ZeroToThree,
    updateBoards: (boards: AllBoards, currentTurn: Player) => void
  ) => void;
  setPreview: (x: ZeroToThree, y: ZeroToThree, boardIndex: ZeroToThree) => void;
  clearPreview: (boardIndex: ZeroToThree) => void;
}

const useStore = create<State>()((set) => ({
  playerType: undefined,
  boards: undefined,
  boardsBeforePassiveMove: undefined,
  currentTurn: undefined,
  selectedStone: undefined,
  moveType: "passive",
  passiveMoveBoardColor: undefined,
  moveVector: undefined,
  clearGameData: () =>
    set(() => ({
      playerType: undefined,
      boards: undefined,
      boardsBeforePassiveMove: undefined,
      currentTurn: undefined,
      selectedStone: undefined,
      moveType: "passive",
      passiveMoveBoardColor: undefined,
      moveVector: undefined,
    })),
  setGameData: (data) =>
    set((state) => {
      if (
        !areBoardsEqual(
          data?.boards,
          state.boardsBeforePassiveMove ?? state.boards
        ) ||
        data?.currentTurn !== state.currentTurn ||
        data?.playerType !== state.playerType
      ) {
        return {
          boards: data?.boards,
          boardsBeforePassiveMove: undefined,
          currentTurn: data?.currentTurn,
          playerType: data?.playerType,
          selectedStone: undefined,
          moveType: "passive",
          passiveMoveBoardColor: undefined,
          moveVector: undefined,
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
        const vectors: [MoveVector, MoveVector][] = [
          [
            { x: 0, y: 1 },
            { x: 0, y: 2 },
          ],
          [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
          ],
          [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
          ],
          [
            { x: 1, y: -1 },
            { x: 2, y: -2 },
          ],
          [
            { x: 0, y: -1 },
            { x: 0, y: -2 },
          ],
          [
            { x: -1, y: -1 },
            { x: -2, y: -2 },
          ],
          [
            { x: -1, y: 0 },
            { x: -2, y: 0 },
          ],
          [
            { x: -1, y: 1 },
            { x: -2, y: 2 },
          ],
        ];
        vectors.forEach((tuple) => {
          const [short, long] = tuple;
          const nearTile = getTile(x, y, short, newBoard);
          if (nearTile?.content === "empty") {
            newBoard[nearTile.y][nearTile.x].passiveMoveTarget = true;
            const farTile = getTile(x, y, long, newBoard);
            if (farTile?.content === "empty") {
              newBoard[farTile.y][farTile.x].passiveMoveTarget = true;
            }
          }
        });
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
        boards: getUpdatedBoards(newBoard, boardIndex, boards),
        boardsBeforePassiveMove: boards,
        moveType: "aggressive",
        passiveMoveBoardColor: boardColor,
        moveVector,
      };
    }),
  undoPassiveMove: () =>
    set(({ boards, selectedStone, moveVector, playerType }) => {
      if (!boards || !selectedStone || !moveVector || !playerType) return {};
      const newBoard = copyBoard(boards[selectedStone.boardIndex]);
      const dest = getTile(
        selectedStone.x,
        selectedStone.y,
        moveVector,
        newBoard
      );
      if (!dest) return {};
      newBoard[dest.y][dest.x].content = "empty";
      newBoard[selectedStone.y][selectedStone.x].content = playerType;
      return {
        boards: getUpdatedBoards(newBoard, selectedStone.boardIndex, boards),
        boardsBeforePassiveMove: undefined,
        moveType: "passive",
        passiveMoveBoardColor: undefined,
        moveVector: undefined,
        selectedStone: undefined,
      };
    }),
  makeAggressiveMove: (x, y, boardIndex, updateBoards) =>
    set(({ moveVector, boards, playerType, currentTurn }) => {
      if (!moveVector || !boards || !playerType || !currentTurn) return {};
      const newBoards = getBoardsWithAggressiveMoveChanges(
        x,
        y,
        boardIndex,
        moveVector,
        boards,
        playerType
      );
      if (!newBoards) return {};
      const newCurrentTurn =
        currentTurn === "black"
          ? "white"
          : currentTurn === "white"
          ? "black"
          : currentTurn;
      updateBoards(newBoards, newCurrentTurn);
      return {
        boards: newBoards,
        boardsBeforePassiveMove: undefined,
        currentTurn: newCurrentTurn,
        moveType: "passive",
        passiveMoveBoardColor: undefined,
        moveVector: undefined,
        selectedStone: undefined,
      };
    }),
  setPreview: (x, y, boardIndex) =>
    set(({ moveVector, boards, playerType }) => {
      if (!moveVector || !boards || !playerType) return {};
      const newBoards = getBoardsWithAggressiveMoveChanges(
        x,
        y,
        boardIndex,
        moveVector,
        boards,
        playerType,
        true
      );
      if (!newBoards) return {};
      return { boards: newBoards };
    }),
  clearPreview: (boardIndex) =>
    set(({ boards }) => {
      if (!boards) return {};
      const newBoard = copyBoard(boards[boardIndex]);
      newBoard.forEach((row) =>
        row.forEach((tile) => (newBoard[tile.y][tile.x].preview = undefined))
      );
      return { boards: getUpdatedBoards(newBoard, boardIndex, boards) };
    }),
}));

const getBoardsWithAggressiveMoveChanges = (
  x: ZeroToThree,
  y: ZeroToThree,
  boardIndex: ZeroToThree,
  moveVector: MoveVector,
  boards: AllBoards,
  playerType: Player,
  preview?: boolean
): AllBoards | undefined => {
  const board = boards[boardIndex];
  const dest = getTile(x, y, moveVector, board);
  if (!dest) return;
  const newBoard = copyBoard(board);
  const beforeDestVector = modifyVectorLength(moveVector, -1);
  const beforeDest =
    beforeDestVector.x !== 0 || beforeDestVector.y !== 0
      ? getTile(x, y, beforeDestVector, board)
      : undefined;
  const destinationContent =
    dest.content === "empty" && beforeDest ? beforeDest.content : dest.content;
  const afterDestVector = modifyVectorLength(moveVector, 1);
  const afterDest = getTile(x, y, afterDestVector, board);
  if (preview) {
    newBoard[y][x].preview = "empty";
    newBoard[dest.y][dest.x].preview = playerType;
    if (afterDest?.content === "empty") {
      newBoard[afterDest.y][afterDest.x].preview = destinationContent;
    }
    if (beforeDest) {
      newBoard[beforeDest.y][beforeDest.x].preview = "empty";
    }
  } else {
    newBoard[y][x].content = "empty";
    newBoard[dest.y][dest.x].content = playerType;
    if (afterDest?.content === "empty") {
      newBoard[afterDest.y][afterDest.x].content = destinationContent;
    }
    if (beforeDest) {
      newBoard[beforeDest.y][beforeDest.x].content = "empty";
    }
  }
  return getUpdatedBoards(newBoard, boardIndex, boards);
};

export default useStore;
