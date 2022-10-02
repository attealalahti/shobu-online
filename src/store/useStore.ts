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

interface State {
  playerType: Player | undefined;
  boards: AllBoards | undefined;
  currentTurn: Player | undefined;
  selectedStone: StoneCoordinates | undefined;
  moveType: Move;
  passiveMoveBoardColor: BoardColor | undefined;
  moveVector: MoveVector | undefined;
  setBoard: (board: BoardState, index: ZeroToThree) => void;
  setBoards: (boards: AllBoards | undefined) => void;
  endTurn: () => void;
  setCurrentTurn: (currentTurn: Player | undefined) => void;
  setSelectedStone: (selectedStone: StoneCoordinates | undefined) => void;
  setPlayerType: (playerType: Player | undefined) => void;
  setMoveType: (moveType: Move) => void;
  setPassiveMoveBoardColor: (color: BoardColor | undefined) => void;
  setMoveVector: (moveVector: MoveVector | undefined) => void;
}

const useStore = create<State>()((set) => ({
  playerType: undefined,
  boards: undefined,
  currentTurn: undefined,
  selectedStone: undefined,
  moveType: "passive",
  passiveMoveBoardColor: undefined,
  moveVector: undefined,
  setBoard: (board, index) =>
    set((state) => {
      if (!state.boards) return {};
      state.boards[index] = board;
      return { boards: state.boards };
    }),
  setBoards: (boards) => set(() => ({ boards })),
  endTurn: () =>
    set((state) => {
      const currentTurn =
        state.currentTurn === "black"
          ? "white"
          : state.currentTurn === "white"
          ? "black"
          : state.currentTurn;
      return {
        currentTurn,
        moveType: "passive",
        passiveMoveBoardColor: undefined,
        moveVector: undefined,
      };
    }),
  setCurrentTurn: (currentTurn) => set(() => ({ currentTurn })),
  setSelectedStone: (selectedStone) => set(() => ({ selectedStone })),
  setPlayerType: (playerType) => set(() => ({ playerType })),
  setMoveType: (moveType) => set(() => ({ moveType })),
  setPassiveMoveBoardColor: (color) =>
    set(() => ({ passiveMoveBoardColor: color })),
  setMoveVector: (moveVector) => set(() => ({ moveVector })),
}));

export default useStore;
