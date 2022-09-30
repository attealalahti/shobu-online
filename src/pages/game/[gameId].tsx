import type { NextPage } from "next";
import dynamic from "next/dynamic";

const DynamicGame = dynamic(() => import("../../components/game"), {
  ssr: false,
});

const GamePage: NextPage = () => {
  return <DynamicGame />;
};

export default GamePage;
