import { trpc } from "./trpc";

const usePlayerId = () => {
  const storedId = localStorage.getItem("id");
  const playerId = trpc.useQuery(["game.id"], {
    enabled: !storedId,
    initialData: storedId ?? undefined,
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess: (data) => localStorage.setItem("id", data),
  });
  return playerId.data;
};

export default usePlayerId;
