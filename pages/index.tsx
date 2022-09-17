import type { NextPage } from "next";
import Head from "next/head";
import Board from "../components/board";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black w-screen h-screen">
        <div className="w-full h-full grid grid-cols-2 p-10 max-w-5xl m-auto">
          <Board color="dark" />
          <Board color="light" />
          <hr className="col-span-2 m-auto h-1 w-4/5" />
          <Board color="dark" />
          <Board color="light" />
        </div>
      </main>
    </div>
  );
};

export default Home;
