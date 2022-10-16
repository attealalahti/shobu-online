import Image from "next/image";
import whiteStone from "../../public/images/white_stone.svg";
import blackStone from "../../public/images/black_stone.svg";
import type {
  ZeroToThree,
  BoardType,
  AllBoards,
  Player,
} from "../types/game-types";
import useStore from "../store/useStore";
import { getTile, modifyVectorLength } from "../utils/game-utils";

type BoardProps = {
  boardIndex: ZeroToThree;
  updateBoards: (boards: AllBoards, currentTurn: Player) => void;
};
const Board = ({ boardIndex, updateBoards }: BoardProps) => {
  const color = boardIndex % 2 === 0 ? "dark" : "light";

  const board = useStore((state) =>
    state.boards ? state.boards[boardIndex] : undefined
  );
  const selectedStone = useStore((state) => state.selectedStone);
  const playerType = useStore((state) => state.playerType);
  const enemyPlayerType = playerType === "black" ? "white" : "black";
  const currentTurn = useStore((state) => state.currentTurn);
  const moveType = useStore((state) => state.moveType);
  const passiveMoveBoardColor = useStore(
    (state) => state.passiveMoveBoardColor
  );
  const moveVector = useStore((state) => state.moveVector);
  const selectPassiveMoveStone = useStore(
    (state) => state.selectPassiveMoveStone
  );
  const makePassiveMove = useStore((state) => state.makePassiveMove);
  const makeAggressiveMove = useStore((state) => state.makeAggressiveMove);
  const setPreview = useStore((state) => state.setPreview);
  const clearPreview = useStore((state) => state.clearPreview);

  if (!board || !playerType) return null;

  const onPassiveMoveClick = (x: ZeroToThree, y: ZeroToThree) => {
    if (!selectedStone || (x === selectedStone?.x && y === selectedStone?.y)) {
      selectPassiveMoveStone(x, y, boardIndex);
    } else if (selectedStone) {
      makePassiveMove(x, y, boardIndex, color);
    }
  };

  const onAggressiveMoveClick = (x: ZeroToThree, y: ZeroToThree) => {
    clearPreview();
    makeAggressiveMove(x, y, boardIndex, updateBoards);
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
      } m-auto my-10 grid h-64 w-64 grid-cols-4`}
    >
      {(playerType === "white" ? board.flat().reverse() : board.flat()).map(
        (
          {
            content,
            selected,
            passiveMoveTarget: possibleToMoveTo,
            preview,
            x,
            y,
          },
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
            color !== passiveMoveBoardColor &&
            moveVector;

          let canMakeAggressiveMove = false;
          if (aggressiveMoveToBeSelected) {
            const targetTile = getTile(x, y, moveVector, board);
            const afterTargetVector = modifyVectorLength(moveVector, 1);
            const tileAfterTarget = getTile(x, y, afterTargetVector, board);
            const beforeTargetVector = modifyVectorLength(moveVector, -1);
            const tileBeforeTarget =
              beforeTargetVector.x !== 0 || beforeTargetVector.y !== 0
                ? getTile(x, y, beforeTargetVector, board)
                : undefined;
            const canMoveToTarget =
              targetTile !== undefined &&
              ((targetTile.content === "empty" &&
                (tileBeforeTarget === undefined ||
                  tileBeforeTarget.content === "empty")) ||
                (targetTile.content === enemyPlayerType &&
                  (tileBeforeTarget === undefined ||
                    tileBeforeTarget.content === "empty")) ||
                (targetTile.content === "empty" &&
                  tileBeforeTarget?.content === enemyPlayerType));
            const roomToPush =
              tileAfterTarget?.content === "empty" ||
              tileAfterTarget === undefined;
            const targetCanBePushed =
              ((targetTile?.content === enemyPlayerType &&
                (tileBeforeTarget === undefined ||
                  tileBeforeTarget.content === "empty")) ||
                (tileBeforeTarget?.content === enemyPlayerType &&
                  targetTile?.content === "empty")) &&
              roomToPush;
            const nothingInTheWay =
              targetTile?.content === "empty" &&
              (tileBeforeTarget === undefined ||
                tileBeforeTarget.content === "empty");
            canMakeAggressiveMove =
              canMoveToTarget && (targetCanBePushed || nothingInTheWay);
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
              onMouseOver={() => {
                if (selectableForAggressiveMove) {
                  setPreview(x, y, boardIndex);
                }
              }}
              onMouseOut={() => {
                if (selectableForAggressiveMove) {
                  clearPreview();
                }
              }}
              key={index}
              className={`${
                selectableForPassiveMove ||
                selected ||
                selectableForAggressiveMove
                  ? "bg-blue-400"
                  : ""
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
              {(preview !== undefined && preview !== "empty") ||
              (preview === undefined && content !== "empty") ? (
                <div
                  className={`${
                    preview ? "opacity-50" : ""
                  } m-auto flex h-16 w-16 justify-center align-middle`}
                >
                  <Image
                    src={
                      preview
                        ? preview === "white"
                          ? whiteStone
                          : blackStone
                        : content === "white"
                        ? whiteStone
                        : blackStone
                    }
                    alt={preview ?? content}
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
