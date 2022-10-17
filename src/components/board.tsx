import Image from "next/image";
import whiteStone from "../../public/images/white_stone.svg";
import blackStone from "../../public/images/black_stone.svg";
import type {
  ZeroToThree,
  BoardType,
  AllBoards,
  Player,
  Tile,
  MoveVector,
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
  const winner = useStore((state) => state.winner);

  if (!board || !playerType) return null;

  const onPassiveMoveClick = (x: ZeroToThree, y: ZeroToThree) => {
    if (!selectedStone || (x === selectedStone?.x && y === selectedStone?.y)) {
      selectPassiveMoveStone(x, y, boardIndex);
    } else if (selectedStone) {
      makePassiveMove(x, y, boardIndex, color);
    }
  };

  const onAggressiveMoveClick = (x: ZeroToThree, y: ZeroToThree) => {
    makeAggressiveMove(x, y, boardIndex, updateBoards);
  };

  const boardType: BoardType =
    (playerType === "black" && boardIndex > 1) ||
    (playerType === "white" && boardIndex < 2)
      ? "home"
      : "enemy";

  const getBorderStyle = (x: number, y: number): string => {
    return `${
      (x > 0 && playerType === "white") || (x < 3 && playerType !== "white")
        ? "border-r border-black"
        : ""
    } ${
      (y > 0 && playerType === "white") || (y < 3 && playerType !== "white")
        ? "border-b border-black"
        : ""
    }`;
  };

  const baseBackgroundColorStyle =
    color === "dark" ? "bg-gray-700" : "bg-gray-200";

  const getAggressiveMovePreviews = ({ content, x, y }: Tile) => {
    if (
      winner ||
      moveType === "passive" ||
      content !== playerType ||
      !passiveMoveBoardColor ||
      color === passiveMoveBoardColor ||
      !moveVector
    ) {
      return [];
    }
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
      tileAfterTarget?.content === "empty" || tileAfterTarget === undefined;
    const targetCanBePushed =
      ((targetTile?.content === enemyPlayerType &&
        (tileBeforeTarget === undefined ||
          tileBeforeTarget.content === "empty")) ||
        (tileBeforeTarget?.content === enemyPlayerType &&
          targetTile?.content === "empty")) &&
      roomToPush;
    const nothingInTheWay =
      targetTile?.content === "empty" &&
      (tileBeforeTarget === undefined || tileBeforeTarget.content === "empty");

    if (!(canMoveToTarget && (targetCanBePushed || nothingInTheWay))) {
      return [];
    }
    const previews: [tile: Tile, vector: MoveVector][] = [];
    previews.push([
      { content: "empty", x, y },
      { x: 0, y: 0 },
    ]);
    previews.push([{ ...targetTile, content: playerType }, moveVector]);
    if (tileBeforeTarget?.content === enemyPlayerType) {
      previews.push([
        { ...tileBeforeTarget, content: "empty" },
        beforeTargetVector,
      ]);
    }
    if (
      (tileBeforeTarget?.content === enemyPlayerType ||
        targetTile?.content === enemyPlayerType) &&
      tileAfterTarget
    ) {
      previews.push([
        { ...tileAfterTarget, content: enemyPlayerType },
        afterTargetVector,
      ]);
    }
    return previews;
  };

  const previewVectorModifier = playerType === "black" ? 1 : -1;

  return (
    <div
      className={`${baseBackgroundColorStyle} m-auto my-10 grid h-64 w-64 grid-cols-4`}
    >
      {(playerType === "white" ? board.flat().reverse() : board.flat()).map(
        ({ content, selected, passiveMoveTarget, x, y }, index) => {
          const selectableForPassiveMove =
            !winner &&
            moveType === "passive" &&
            boardType === "home" &&
            !selectedStone &&
            content === playerType &&
            currentTurn === playerType;

          const passiveMoveClickable =
            selectedStone && (board[y][x].selected || passiveMoveTarget);

          const aggressiveMovePreviews = getAggressiveMovePreviews({
            content,
            x,
            y,
          });

          return (
            <button
              onClick={() =>
                moveType === "passive"
                  ? onPassiveMoveClick(x, y)
                  : onAggressiveMoveClick(x, y)
              }
              key={index}
              className={`${
                selectableForPassiveMove ||
                selected ||
                aggressiveMovePreviews.length > 0
                  ? "bg-blue-400"
                  : ""
              } ${passiveMoveTarget ? "bg-red-400" : ""} ${getBorderStyle(
                x,
                y
              )} h-16 w-16`}
              disabled={
                !(
                  selectableForPassiveMove ||
                  passiveMoveClickable ||
                  aggressiveMovePreviews.length > 0
                )
              }
            >
              {/* Tile content */}
              {content !== "empty" && (
                <div className="m-auto flex h-16 w-16 justify-center align-middle">
                  <Image
                    src={content === "white" ? whiteStone : blackStone}
                    alt={content}
                    width={55}
                    height={55}
                    objectFit="contain"
                  />
                  {/* Previews */}
                  <div className="absolute h-16 w-16 opacity-0 hover:opacity-100">
                    {aggressiveMovePreviews.map(([tile, vector], index) => (
                      <div key={index} className="absolute">
                        <div
                          className={`${getBorderStyle(
                            tile.x,
                            tile.y
                          )} ${baseBackgroundColorStyle} pointer-events-none relative z-50 h-16 w-16`}
                          style={{
                            left: vector.x * 64 * previewVectorModifier,
                            top: vector.y * 64 * previewVectorModifier,
                          }}
                        >
                          {tile.content !== "empty" && (
                            <div className="flex h-full w-full justify-center align-middle opacity-60">
                              <Image
                                src={
                                  tile.content === "black"
                                    ? blackStone
                                    : whiteStone
                                }
                                alt={tile.content}
                                width={55}
                                height={55}
                                objectFit="contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        }
      )}
    </div>
  );
};

export default Board;
