import Image from "next/image";
import whiteStone from "../../public/images/white_stone.svg";
import blackStone from "../../public/images/black_stone.svg";
import type { IntRange, BoardState } from "../types/game-types";
import useStore from "../store/useStore";
import { copyBoard } from "../utils/game-utils";

type BoardProps = {
  boardIndex: IntRange;
};
const Board = ({ boardIndex }: BoardProps) => {
  const color = boardIndex % 2 === 0 ? "dark" : "light";

  const board = useStore((state) =>
    state.boards ? state.boards[boardIndex] : undefined
  );
  const selectedStone = useStore((state) => state.selectedStone);
  const playerType = useStore((state) => state.playerType);
  const currentTurn = useStore((state) => state.currentTurn);
  const endTurn = useStore((state) => state.endTurn);
  const setBoard = useStore((state) => state.setBoard);
  const setSelectedStone = useStore((state) => state.setSelectedStone);

  const onTileClicked = (x: IntRange, y: IntRange) => {
    if (!selectedStone || (x === selectedStone?.x && y === selectedStone?.y)) {
      selectStone(x, y);
    } else if (selectedStone) {
      moveStone(x, y);
    }
  };

  const selectStone = (x: IntRange, y: IntRange) => {
    if (!board) return;
    const newBoard = copyBoard(board);
    newBoard[y][x].selected = !newBoard[y][x].selected;
    if (newBoard[y][x].selected) {
      let up1: IntRange | undefined;
      let up2: IntRange | undefined;
      let right1: IntRange | undefined;
      let right2: IntRange | undefined;
      let down1: IntRange | undefined;
      let down2: IntRange | undefined;
      let left1: IntRange | undefined;
      let left2: IntRange | undefined;
      if (y - 1 >= 0) {
        up1 = (y - 1) as IntRange;
        if (y - 2 >= 0) {
          up2 = (y - 2) as IntRange;
        }
      }
      if (x + 1 < 4) {
        right1 = (x + 1) as IntRange;
        if (x + 2 < 4) {
          right2 = (x + 2) as IntRange;
        }
      }
      if (y + 1 < 4) {
        down1 = (y + 1) as IntRange;
        if (y + 2 < 4) {
          down2 = (y + 2) as IntRange;
        }
      }
      if (x - 1 >= 0) {
        left1 = (x - 1) as IntRange;
        if (x - 2 >= 0) {
          left2 = (x - 2) as IntRange;
        }
      }
      if (up1 !== undefined) {
        if (newBoard[up1][x].content === "empty") {
          newBoard[up1][x].possibleToMoveTo = true;
          if (up2 !== undefined && newBoard[up2][x].content === "empty") {
            newBoard[up2][x].possibleToMoveTo = true;
          }
        }
        if (right1 !== undefined && newBoard[up1][right1].content === "empty") {
          newBoard[up1][right1].possibleToMoveTo = true;
          if (
            up2 !== undefined &&
            right2 !== undefined &&
            newBoard[up2][right2].content === "empty"
          ) {
            newBoard[up2][right2].possibleToMoveTo = true;
          }
        }
        if (left1 !== undefined && newBoard[up1][left1].content === "empty") {
          newBoard[up1][left1].possibleToMoveTo = true;
          if (
            up2 !== undefined &&
            left2 !== undefined &&
            newBoard[up2][left2].content === "empty"
          ) {
            newBoard[up2][left2].possibleToMoveTo = true;
          }
        }
      }
      if (down1 !== undefined) {
        if (
          right1 !== undefined &&
          newBoard[down1][right1].content === "empty"
        ) {
          newBoard[down1][right1].possibleToMoveTo = true;
          if (
            down2 !== undefined &&
            right2 !== undefined &&
            newBoard[down2][right2].content === "empty"
          ) {
            newBoard[down2][right2].possibleToMoveTo = true;
          }
        }
        if (newBoard[down1][x].content === "empty") {
          newBoard[down1][x].possibleToMoveTo = true;
          if (down2 !== undefined && newBoard[down2][x].content === "empty") {
            newBoard[down2][x].possibleToMoveTo = true;
          }
        }
        if (left1 !== undefined && newBoard[down1][left1].content === "empty") {
          newBoard[down1][left1].possibleToMoveTo = true;
          if (
            down2 !== undefined &&
            left2 !== undefined &&
            newBoard[down2][left2].content === "empty"
          ) {
            newBoard[down2][left2].possibleToMoveTo = true;
          }
        }
      }
      if (right1 !== undefined && newBoard[y][right1].content === "empty") {
        newBoard[y][right1].possibleToMoveTo = true;
        if (right2 !== undefined && newBoard[y][right2].content === "empty") {
          newBoard[y][right2].possibleToMoveTo = true;
        }
      }
      if (left1 !== undefined && newBoard[y][left1].content === "empty") {
        newBoard[y][left1].possibleToMoveTo = true;
        if (left2 !== undefined && newBoard[y][left2].content === "empty") {
          newBoard[y][left2].possibleToMoveTo = true;
        }
      }
    } else {
      clearMoveTargets(newBoard);
    }
    setSelectedStone(
      newBoard[y][x].selected ? { x, y, boardIndex } : undefined
    );
    setBoard(newBoard, boardIndex);
  };

  const clearMoveTargets = (board: BoardState) => {
    for (let i: IntRange = 0; i < 4; i = (i + 1) as IntRange) {
      for (let j: IntRange = 0; j < 4; j = (j + 1) as IntRange) {
        board[i][j].possibleToMoveTo = false;
      }
    }
  };

  const moveStone = (x: IntRange, y: IntRange) => {
    if (!selectedStone || !playerType || !board) return;
    const newBoard = copyBoard(board);
    newBoard[y][x].content = playerType;
    clearMoveTargets(newBoard);
    newBoard[selectedStone.y][selectedStone.x].content = "empty";
    newBoard[selectedStone.y][selectedStone.x].selected = false;
    setSelectedStone(undefined);
    setBoard(newBoard, boardIndex);
    endTurn();
  };

  if (!board) return null;
  return (
    <div
      className={`${
        color === "dark" ? "bg-gray-700" : "bg-gray-200"
      } m-auto grid h-64 w-64 grid-cols-4`}
    >
      {board
        .flat()
        .map(({ content, selected, possibleToMoveTo, x, y }, index) => (
          <button
            onClick={() => onTileClicked(x, y)}
            key={index}
            className={`${selected ? "bg-blue-400" : ""} ${
              possibleToMoveTo ? "bg-red-400" : ""
            } ${x < 3 ? "border-r border-black" : ""} ${
              y < 3 ? "border-b border-black" : ""
            } h-16 w-16`}
            disabled={
              !(
                (!selectedStone &&
                  content === playerType &&
                  currentTurn === playerType) ||
                (selectedStone && (board[y][x].selected || possibleToMoveTo))
              )
            }
          >
            {content !== "empty" ? (
              <div className="m-auto flex h-16 w-16 justify-center align-middle">
                <Image
                  src={content === "white" ? whiteStone : blackStone}
                  alt={content}
                  width={55}
                  height={55}
                  objectFit="contain"
                />
              </div>
            ) : null}
          </button>
        ))}
    </div>
  );
};

export default Board;
