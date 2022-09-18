import type { Player, BoardState } from "./game-types";

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
  join: (callback: (player: Player, noBoard?: boolean) => void) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  player: Player;
}
