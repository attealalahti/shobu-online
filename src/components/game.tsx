import { useEffect, useState, useMemo } from "react";
import { Socket, io } from "socket.io-client";
import Board from "../components/board";
import { ClientToServerEvents, ServerToClientEvents } from "../types/ws-types";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
import useStore from "../store/useStore";
import usePlayerId from "../utils/usePlayerId";
import Image from "next/image";
import backArrow from "../../public/images/back-arrow.svg";
import { AllBoards, Player } from "../types/game-types";
import { formatBoardsForDb } from "../utils/game-utils";

const Game = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const router = useRouter();
  const gameId = router.query.gameId as string;
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useMemo(
    () => io(`/${gameId}`),
    [gameId]
  );

  const playerType = useStore((state) => state.playerType);
  const clearGameData = useStore((state) => state.clearGameData);
  const setGameData = useStore((state) => state.setGameData);
  const moveType = useStore((state) => state.moveType);
  const undoPassiveMove = useStore((state) => state.undoPassiveMove);
  onblur = undoPassiveMove;

  router.beforePopState(() => {
    clearGameData();
    return true;
  });

  const playerId = usePlayerId();

  const utils = trpc.useContext();
  trpc.useQuery(
    [
      "game.data",
      playerId && gameId
        ? { playerId, gameId: router.query.gameId as string }
        : undefined,
    ],
    { onSuccess: setGameData }
  );
  const mutation = trpc.useMutation("game.update", {
    onSuccess: (success) => {
      if (success) {
        socket.emit("takeTurn");
      }
    },
  });
  const updateBoards = (boards: AllBoards, currentTurn: Player) => {
    mutation.mutate({ gameId, boards: formatBoardsForDb(boards), currentTurn });
  };

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("turnTaken", () => utils.invalidateQueries("game.data"));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("turnTaken");
    };
  }, [socket, utils]);

  return (
    <div>
      <main className="h-screen w-screen bg-black">
        {connected && playerType ? (
          <div className="flex h-full w-full flex-row justify-center align-middle">
            <div className="grid w-full max-w-5xl flex-auto grid-cols-2 p-10">
              <Board
                boardIndex={playerType === "white" ? 3 : 0}
                updateBoards={updateBoards}
              />
              <Board
                boardIndex={playerType === "white" ? 2 : 1}
                updateBoards={updateBoards}
              />
              <hr className="col-span-2 m-auto my-10 h-1 w-4/5" />
              <Board
                boardIndex={playerType === "white" ? 1 : 2}
                updateBoards={updateBoards}
              />
              <Board
                boardIndex={playerType === "white" ? 0 : 3}
                updateBoards={updateBoards}
              />
            </div>
            <div className="flex">
              <div className="m-auto mr-10">
                <button
                  className={`${
                    moveType === "passive" ? "opacity-30" : ""
                  } rounded bg-white p-5`}
                  disabled={moveType === "passive"}
                  onClick={undoPassiveMove}
                >
                  <Image
                    src={backArrow}
                    alt="Cancel passive move"
                    width={60}
                    height={60}
                  />
                </button>
              </div>
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
