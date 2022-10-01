import Head from "next/head";
import { useEffect, useState, useMemo } from "react";
import { Socket, io } from "socket.io-client";
import Board from "../components/board";
import {
  AllBoards,
  BoardState,
  IntRange,
  Player,
  StoneCoordinates,
} from "../types/game-types";
import { ClientToServerEvents, ServerToClientEvents } from "../types/ws-types";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
import { copyAllBoards, equalBoards } from "../utils/game-utils";

const Game = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const router = useRouter();
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useMemo(
    () => io(`/${router.query.gameId}`),
    [router.query.gameId]
  );

  const [boards, setBoards] = useState<AllBoards | undefined>(undefined);
  const [currentTurn, setCurrentTurn] = useState<Player | undefined>(undefined);
  const [selectedStone, setSelectedStone] = useState<
    StoneCoordinates | undefined
  >(undefined);

  const storedId = localStorage.getItem("id");
  const playerId = trpc.useQuery(["game.id"], {
    enabled: !storedId,
    initialData: storedId ?? undefined,
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess: (data) => {
      localStorage.setItem("id", data);
    },
  });

  const game = trpc.useQuery(
    [
      "game.join",
      playerId.data
        ? { playerId: playerId.data, gameId: router.query.gameId as string }
        : undefined,
    ],
    {
      onSuccess: (data) => {
        if (
          !equalBoards(data?.boards, boards) ||
          data?.currentTurn !== currentTurn
        ) {
          setBoards(data?.boards);
          setCurrentTurn(data?.currentTurn);
        }
      },
    }
  );
  const playerType = game.data?.playerType;

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  const endTurn = () => {
    if (playerType === "black") {
      setCurrentTurn("white");
    } else if (playerType === "white") {
      setCurrentTurn("black");
    }
  };

  const onTileClicked = (x: IntRange, y: IntRange, boardIndex: IntRange) => {
    if (!selectedStone || (x === selectedStone?.x && y === selectedStone?.y)) {
      selectStone(x, y, boardIndex);
    } else if (selectedStone) {
      moveStone(x, y, boardIndex);
    }
  };

  const selectStone = (x: IntRange, y: IntRange, boardIndex: IntRange) => {
    if (!boards) return;
    const newBoards = copyAllBoards(boards);
    const newBoard = newBoards[boardIndex];
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
    newBoards[boardIndex] = newBoard;
    setBoards(newBoards);
  };

  const clearMoveTargets = (board: BoardState) => {
    for (let i: IntRange = 0; i < 4; i = (i + 1) as IntRange) {
      for (let j: IntRange = 0; j < 4; j = (j + 1) as IntRange) {
        board[i][j].possibleToMoveTo = false;
      }
    }
  };

  const moveStone = (x: IntRange, y: IntRange, boardIndex: IntRange) => {
    if (selectedStone && playerType && boards) {
      const newBoards = copyAllBoards(boards);
      const newBoard = newBoards[boardIndex];
      newBoard[y][x].content = playerType;
      clearMoveTargets(newBoard);
      newBoard[selectedStone.y][selectedStone.x].content = "empty";
      newBoard[selectedStone.y][selectedStone.x].selected = false;
      setSelectedStone(undefined);
      newBoards[boardIndex] = newBoard;
      setBoards(newBoards);
      endTurn();
    }
  };

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen w-screen bg-black">
        {connected && playerType && currentTurn && boards ? (
          <div className="flex h-full w-full flex-col justify-center align-middle">
            <div className="flex-grow-0 text-white">{`playerType: ${playerType}, currentTurn: ${currentTurn}`}</div>
            <div className="m-auto grid w-full max-w-5xl flex-auto grid-cols-2 p-10">
              <Board
                color="dark"
                playerType={playerType}
                currentTurn={currentTurn}
                board={boards[0]}
                selectedStone={selectedStone}
                onTileClicked={(x, y) => onTileClicked(x, y, 0)}
              />
              <Board
                color="light"
                playerType={playerType}
                currentTurn={currentTurn}
                board={boards[1]}
                selectedStone={selectedStone}
                onTileClicked={(x, y) => onTileClicked(x, y, 1)}
              />
              <hr className="col-span-2 m-auto h-1 w-4/5" />
              <Board
                color="dark"
                playerType={playerType}
                currentTurn={currentTurn}
                board={boards[2]}
                selectedStone={selectedStone}
                onTileClicked={(x, y) => onTileClicked(x, y, 2)}
              />
              <Board
                color="light"
                playerType={playerType}
                currentTurn={currentTurn}
                board={boards[3]}
                selectedStone={selectedStone}
                onTileClicked={(x, y) => onTileClicked(x, y, 3)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full">
            <div className="m-auto text-lg text-white">Loading...</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Game;
