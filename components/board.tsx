import Image from "next/image";
import { useState } from "react";
import whiteStone from "../public/images/white_stone.svg";
import blackStone from "../public/images/black_stone.svg";

type Player = "black" | "white";
type Coordinate = 0 | 1 | 2 | 3;
type Tile = {
  content: Player | "empty";
  selected?: boolean;
  possibleToMoveTo?: boolean;
  x: Coordinate;
  y: Coordinate;
};
type BoardState = [
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile]
];

const player: Player = "black";
const opponent: Player = player === "black" ? "white" : "black";

const startingBoard: BoardState = [
  [
    { content: opponent, x: 0, y: 0 },
    { content: opponent, x: 1, y: 0 },
    { content: opponent, x: 2, y: 0 },
    { content: opponent, x: 3, y: 0 },
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
    { content: player, x: 0, y: 3 },
    { content: player, x: 1, y: 3 },
    { content: player, x: 2, y: 3 },
    { content: player, x: 3, y: 3 },
  ],
];

const Board = () => {
  const [board, setBoard] = useState<BoardState>(startingBoard);
  const [selectedStone, setSelectedStone] = useState<
    { x: Coordinate; y: Coordinate } | undefined
  >(undefined);

  const onTileClicked = (x: Coordinate, y: Coordinate) => {
    if (!selectedStone || (x === selectedStone?.x && y === selectedStone?.y)) {
      selectStone(x, y);
    } else if (selectedStone) {
      moveStone(x, y);
    }
  };

  const selectStone = (x: Coordinate, y: Coordinate) => {
    const newBoard: BoardState = [...board];
    newBoard[y][x].selected = !newBoard[y][x].selected;
    if (newBoard[y][x].selected) {
      let up1: Coordinate | undefined;
      let up2: Coordinate | undefined;
      let right1: Coordinate | undefined;
      let right2: Coordinate | undefined;
      let down1: Coordinate | undefined;
      let down2: Coordinate | undefined;
      let left1: Coordinate | undefined;
      let left2: Coordinate | undefined;
      if (y - 1 >= 0) {
        up1 = (y - 1) as Coordinate;
        if (y - 2 >= 0) {
          up2 = (y - 2) as Coordinate;
        }
      }
      if (x + 1 < 4) {
        right1 = (x + 1) as Coordinate;
        if (x + 2 < 4) {
          right2 = (x + 2) as Coordinate;
        }
      }
      if (y + 1 < 4) {
        down1 = (y + 1) as Coordinate;
        if (y + 2 < 4) {
          down2 = (y + 2) as Coordinate;
        }
      }
      if (x - 1 >= 0) {
        left1 = (x - 1) as Coordinate;
        if (x - 2 >= 0) {
          left2 = (x - 2) as Coordinate;
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
        if (right1 !== undefined && newBoard[down1][right1].content === "empty") {
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
    setSelectedStone(newBoard[y][x].selected ? { x, y } : undefined);
    setBoard(newBoard);
  };

  const clearMoveTargets = (board: BoardState) => {
    for (let i: Coordinate = 0; i < 4; i = (i + 1) as Coordinate) {
      for (let j: Coordinate = 0; j < 4; j = (j + 1) as Coordinate) {
        board[i][j].possibleToMoveTo = false;
      }
    }
  };

  const moveStone = (x: Coordinate, y: Coordinate) => {
    if (selectedStone) {
      const newBoard: BoardState = [...board];
      newBoard[y][x].content = player;
      clearMoveTargets(newBoard);
      newBoard[selectedStone.y][selectedStone.x].content = "empty";
      newBoard[selectedStone.y][selectedStone.x].selected = false;
      setSelectedStone(undefined);
      setBoard(newBoard);
    }
  };

  return (
    <div className="w-64 h-64 bg-white m-auto grid grid-cols-4">
      {board.flat().map(({ content, selected, possibleToMoveTo, x, y }, index) => (
        <button
          onClick={() => onTileClicked(x, y)}
          key={index}
          className={`${selected ? "bg-blue-400" : ""} ${
            possibleToMoveTo ? "bg-red-400" : ""
          } w-16 h-16`}
          disabled={
            !(
              (!selectedStone && content !== "empty") ||
              (selectedStone && (board[y][x].selected || possibleToMoveTo))
            )
          }
        >
          {content !== "empty" ? (
            <div className="m-auto w-16 h-16 flex justify-center align-middle">
              <Image
                src={content === "white" ? whiteStone : blackStone}
                alt={content}
                width={55}
                height={55}
                objectFit="contain"
              />
            </div>
          ) : (
            <></>
          )}
        </button>
      ))}
    </div>
  );
};

export default Board;
