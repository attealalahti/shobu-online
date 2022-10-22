import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { trpc } from "../utils/trpc";
const IdGenerator = dynamic(() => import("../components/id-generator"), {
  ssr: false,
});

const Home: NextPage = () => {
  const [idText, setIdText] = useState<string>("");
  const router = useRouter();
  const newGame = trpc.useMutation("game.new", {
    onSuccess: (gameId) => router.push(`/game/${gameId.toLowerCase()}`),
  });

  const joinGame = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/game/${idText.toLowerCase()}`);
  };

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen w-screen bg-black ">
        <IdGenerator />
        <div className="m-auto flex h-full w-full max-w-md flex-col justify-center gap-10 text-center align-middle">
          <button
            className={`${
              newGame.isLoading ? "bg-gray-400 text-gray-800" : ""
            } bg-white p-4 text-2xl font-bold hover:cursor-pointer`}
            disabled={newGame.isLoading}
            onClick={() => newGame.mutate()}
          >
            New Game
          </button>
          <form
            className="flex flex-col gap-6 rounded-lg border-2 border-white p-2"
            onSubmit={joinGame}
          >
            <input
              className="p-2 text-center text-2xl uppercase"
              autoComplete="off"
              placeholder="ID"
              maxLength={6}
              required={true}
              onChange={(e) => setIdText(e.target.value)}
            />
            <input
              className="bg-white p-4 text-2xl font-bold hover:cursor-pointer"
              type="submit"
              value="Join Game"
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default Home;
