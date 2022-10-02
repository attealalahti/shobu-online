import Image from "next/image";
import whiteStone from "../../public/images/white_stone.svg";
import blackStone from "../../public/images/black_stone.svg";
import type {
  ZeroToThree,
  BoardState,
  BoardType,
  MinusTwoToTwo,
  MoveVector,
  Tile,
} from "../types/game-types";
import useStore from "../store/useStore";
import { copyBoard } from "../utils/game-utils";

type BoardProps = {
  boardIndex: ZeroToThree;
};
const Board = ({ boardIndex }: BoardProps) => {
  const color = boardIndex % 2 === 0 ? "dark" : "light";

  const board = useStore((state) =>
    state.boards ? state.boards[boardIndex] : undefined
  );
  const selectedStone = useStore((state) => state.selectedStone);
  const playerType = useStore((state) => state.playerType);
  const enemyPlayerType = playerType === "black" ? "white" : "black";
  const currentTurn = useStore((state) => state.currentTurn);
  const endTurn = useStore((state) => state.endTurn);
  const setBoard = useStore((state) => state.setBoard);
  const setSelectedStone = useStore((state) => state.setSelectedStone);
  const moveType = useStore((state) => state.moveType);
  const setMoveType = useStore((state) => state.setMoveType);
  const passiveMoveBoardColor = useStore(
    (state) => state.passiveMoveBoardColor
  );
  const setPassiveMoveBoardColor = useStore(
    (state) => state.setPassiveMoveBoardColor
  );
  const moveVector = useStore((state) => state.moveVector);
  const setMoveVector = useStore((state) => state.setMoveVector);

  if (!board || !playerType) return null;

  const onPassiveMoveClick = (x: ZeroToThree, y: ZeroToThree) => {
    if (!selectedStone || (x === selectedStone?.x && y === selectedStone?.y)) {
      selectPassiveMoveStone(x, y);
    } else if (selectedStone) {
      makePassiveMove(x, y);
    }
  };

  const onAggressiveMoveClick = (x: ZeroToThree, y: ZeroToThree) => {
    if (!moveVector || !getTile(x, y, moveVector)) return;
    const newBoard = copyBoard(board);
    const dest = {
      x: (x + moveVector.x) as ZeroToThree,
      y: (y + moveVector.y) as ZeroToThree,
    };
    const destinationContent = newBoard[dest.y][dest.x].content;
    newBoard[y][x].content = "empty";
    newBoard[dest.y][dest.x].content = playerType;

    const afterDestVector = modifyVectorLength(moveVector, 1);
    if (getTile(x, y, afterDestVector)?.content === "empty") {
      newBoard[(y + afterDestVector.y) as ZeroToThree][
        (x + afterDestVector.x) as ZeroToThree
      ].content = destinationContent;
    }
    setBoard(newBoard, boardIndex);
    endTurn();
  };

  const selectPassiveMoveStone = (x: ZeroToThree, y: ZeroToThree) => {
    const newBoard = copyBoard(board);
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
        if (right1 !== undefined && newBoard[up1][right1].content === "empty") {
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
        if (left1 !== undefined && newBoard[down1][left1].content === "empty") {
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
    setSelectedStone(
      newBoard[y][x].selected ? { x, y, boardIndex } : undefined
    );
    setBoard(newBoard, boardIndex);
  };

  const clearMoveTargets = (board: BoardState) => {
    for (let i: ZeroToThree = 0; i < 4; i = (i + 1) as ZeroToThree) {
      for (let j: ZeroToThree = 0; j < 4; j = (j + 1) as ZeroToThree) {
        board[i][j].passiveMoveTarget = false;
      }
    }
  };

  const makePassiveMove = (x: ZeroToThree, y: ZeroToThree) => {
    if (!selectedStone || !playerType || !board) return;
    const xDelta = x - selectedStone.x;
    const yDelta = y - selectedStone.y;
    if (xDelta < -2 || xDelta > 2 || yDelta < -2 || yDelta > 2) return;
    setMoveVector({ x: xDelta as MinusTwoToTwo, y: yDelta as MinusTwoToTwo });
    const newBoard = copyBoard(board);
    newBoard[y][x].content = playerType;
    clearMoveTargets(newBoard);
    newBoard[selectedStone.y][selectedStone.x].content = "empty";
    newBoard[selectedStone.y][selectedStone.x].selected = false;
    setSelectedStone(undefined);
    setBoard(newBoard, boardIndex);
    setMoveType("aggressive");
    setPassiveMoveBoardColor(color);
  };

  const getTile = (
    currentX: ZeroToThree,
    currentY: ZeroToThree,
    vector: MoveVector
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

  const modifyVectorLength = (
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

  const boardType: BoardType =
    (playerType === "black" && boardIndex > 1) ||
    (playerType === "white" && boardIndex < 2)
      ? "home"
      : "enemy";
  return (
    <div
      className={`${
        color === "dark" ? "bg-gray-700" : "bg-gray-200"
      } m-auto grid h-64 w-64 grid-cols-4`}
    >
      {(playerType === "white" ? board.flat().reverse() : board.flat()).map(
        (
          { content, selected, passiveMoveTarget: possibleToMoveTo, x, y },
          index
        ) => {
          const selectableForPassiveMove =
            moveType === "passive" &&
            boardType === "home" &&
            !selectedStone &&
            content === playerType &&
            currentTurn === playerType;

          const passiveMoveTarget =
            selectedStone && (board[y][x].selected || possibleToMoveTo);

          const aggressiveMoveToBeSelected =
            moveType === "aggressive" &&
            content === playerType &&
            passiveMoveBoardColor !== undefined &&
            color !== passiveMoveBoardColor;

          let canMakeAggressiveMove = false;
          if (moveVector) {
            const targetTile = getTile(x, y, moveVector);
            const afterTargetVector = modifyVectorLength(moveVector, 1);
            const tileAfterTarget = getTile(x, y, afterTargetVector);
            const beforeTargetVector = modifyVectorLength(moveVector, -1);
            const tileBeforeTarget =
              beforeTargetVector.x !== 0 || beforeTargetVector.y !== 0
                ? getTile(x, y, beforeTargetVector)
                : undefined;
            const canMoveToTarget =
              targetTile !== undefined && targetTile.content !== playerType;
            const targetCanBePushed =
              targetTile?.content === enemyPlayerType &&
              (tileAfterTarget?.content === "empty" ||
                tileAfterTarget === undefined);
            canMakeAggressiveMove =
              canMoveToTarget &&
              (targetCanBePushed || targetTile.content === "empty") &&
              (tileBeforeTarget === undefined ||
                tileBeforeTarget.content === "empty");
          }
          const selectableForAggressiveMove =
            aggressiveMoveToBeSelected && canMakeAggressiveMove;
          return (
            <button
              onClick={() =>
                moveType === "passive"
                  ? onPassiveMoveClick(x, y)
                  : onAggressiveMoveClick(x, y)
              }
              key={index}
              className={`${
                selected || selectableForAggressiveMove ? "bg-blue-400" : ""
              } ${possibleToMoveTo ? "bg-red-400" : ""} ${
                (x > 0 && playerType === "white") ||
                (x < 3 && playerType !== "white")
                  ? "border-r border-black"
                  : ""
              } ${
                (y > 0 && playerType === "white") ||
                (y < 3 && playerType !== "white")
                  ? "border-b border-black"
                  : ""
              } h-16 w-16`}
              disabled={
                !(
                  selectableForPassiveMove ||
                  passiveMoveTarget ||
                  selectableForAggressiveMove
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
          );
        }
      )}
    </div>
  );
};

export default Board;
