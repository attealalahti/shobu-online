import Head from "next/head";
import { useEffect, useState, useMemo } from "react";
import { Socket, io } from "socket.io-client";
import Board from "../components/board";
import { AllBoards, BoardState, IntRange } from "../types/game-types";
import { ClientToServerEvents, ServerToClientEvents } from "../types/ws-types";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
import { QueryClient } from "react-query";

const queryClient = new QueryClient();

const Game = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const router = useRouter();
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useMemo(
    () => io(`/${router.query.gameId}`),
    [router.query.gameId]
  );

  const storedId = localStorage.getItem("id");
  const playerId = trpc.useQuery(["id"], {
    enabled: !storedId,
    initialData: storedId ?? undefined,
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess: (data) => {
      localStorage.setItem("id", data);
    },
  });

  const game = trpc.useQuery([
    "join",
    playerId.data
      ? { playerId: playerId.data, gameId: router.query.gameId as string }
      : undefined,
  ]);
  const playerType = game.data?.playerType;
  const currentTurn = game.data?.currentTurn;
  const boards = game.data?.boards;

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  const updateBoard = (boardIndex: IntRange, newBoard: BoardState) => {
    if (boards) {
      const newBoards: AllBoards = [...boards];
      newBoards[boardIndex] = newBoard;
      queryClient.setQueryData("join", { ...game.data, boards: newBoards });
    }
  };

  const endTurn = () => {
    /*
    if (player === "black") {
      setCurrentTurn("white");
    } else if (player === "white") {
      setCurrentTurn("black");
    }*/
  };

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black w-screen h-screen">
        {connected && playerType && currentTurn && boards ? (
          <div className="w-full h-full flex justify-center align-middle flex-col">
            <div className="flex-grow-0 text-white">{playerType}</div>
            <div className="grid flex-auto grid-cols-2 p-10 w-full max-w-5xl m-auto">
              <Board
                color="dark"
                player={playerType}
                currentTurn={currentTurn}
                updateBoard={updateBoard}
                endTurn={endTurn}
                board={boards[0]}
                boardIndex={0}
              />
              <Board
                color="light"
                player={playerType}
                currentTurn={currentTurn}
                updateBoard={updateBoard}
                endTurn={endTurn}
                board={boards[1]}
                boardIndex={1}
              />
              <hr className="col-span-2 m-auto h-1 w-4/5" />
              <Board
                color="dark"
                player={playerType}
                currentTurn={currentTurn}
                updateBoard={updateBoard}
                endTurn={endTurn}
                board={boards[2]}
                boardIndex={2}
              />
              <Board
                color="light"
                player={playerType}
                currentTurn={currentTurn}
                updateBoard={updateBoard}
                endTurn={endTurn}
                board={boards[3]}
                boardIndex={3}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex">
            <div className="m-auto text-lg text-white">Loading...</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Game;
