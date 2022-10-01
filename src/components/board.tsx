import Image from "next/image";
import whiteStone from "../../public/images/white_stone.svg";
import blackStone from "../../public/images/black_stone.svg";
import type {
  Player,
  IntRange,
  BoardState,
  StoneCoordinates,
} from "../types/game-types";

type BoardProps = {
  color: "dark" | "light";
  playerType: Player;
  currentTurn: Player;
  board: BoardState;
  selectedStone?: StoneCoordinates;
  onTileClicked: (x: IntRange, y: IntRange) => void;
};
const Board = ({
  color,
  playerType,
  currentTurn,
  board,
  selectedStone,
  onTileClicked,
}: BoardProps) => {
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
