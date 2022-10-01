import type { NextPage } from "next";
import dynamic from "next/dynamic";
const Game = dynamic(() => import("../../components/game"), {
  ssr: false,
});

const GamePage: NextPage = () => {
  return <Game />;
};

export default GamePage;
