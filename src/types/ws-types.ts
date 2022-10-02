/* eslint-disable @typescript-eslint/no-empty-interface */
export interface ServerToClientEvents {
  turnTaken: () => void;
}

export interface ClientToServerEvents {
  takeTurn: () => void;
}

export interface InterServerEvents {}

export interface SocketData {}
