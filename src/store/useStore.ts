import create from "zustand";
import type {
  AllBoards,
  BoardState,
  IntRange,
  Player,
  StoneCoordinates,
} from "../types/game-types";

interface State {
  playerType: Player | undefined;
  boards: AllBoards | undefined;
  currentTurn: Player | undefined;
  selectedStone: StoneCoordinates | undefined;
  setBoard: (board: BoardState, index: IntRange) => void;
  setBoards: (boards: AllBoards | undefined) => void;
  endTurn: () => void;
  setCurrentTurn: (currentTurn: Player | undefined) => void;
  setSelectedStone: (selectedStone: StoneCoordinates | undefined) => void;
  setPlayerType: (playerType: Player | undefined) => void;
}

const useStore = create<State>()((set) => ({
  playerType: undefined,
  boards: undefined,
  currentTurn: undefined,
  selectedStone: undefined,
  setBoard: (board, index) =>
    set((state) => {
      if (!state.boards) return {};
      state.boards[index] = board;
      return { boards: state.boards };
    }),
  setBoards: (boards) => set(() => ({ boards })),
  endTurn: () =>
    set((state) => {
      if (state.currentTurn === "black") {
        return { currentTurn: "white" };
      } else if (state.currentTurn === "white") {
        return { currentTurn: "black" };
      } else return {};
    }),
  setCurrentTurn: (currentTurn) => set(() => ({ currentTurn })),
  setSelectedStone: (selectedStone) => set(() => ({ selectedStone })),
  setPlayerType: (playerType) => set(() => ({ playerType })),
}));

export default useStore;
