import type { Player, AllBoards, GameState } from "./game-types";

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
  join: (callback: (player: Player, game: GameState) => void) => void;
}

export interface InterServerEvents {}

export interface SocketData {}
