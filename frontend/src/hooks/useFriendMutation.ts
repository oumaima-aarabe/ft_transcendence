import { fetcher } from "@/lib/fetcher";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const updateFriendState = async ({
  url,
  username,
}: {
  url: string;
  username: string;
}) => {
  try {
    const response = await fetcher.post(url, { username });
    return response.data;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export const useFriendMutation = (username?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFriendState,
    onSuccess: () => {
      // Invalidate all relevant queries
      if (username) {
        queryClient.invalidateQueries({
          queryKey: ["friendshipStatus", username],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["blocked"] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["sent-invitations"] });
    },
    onError: (error) => {
      console.log("state not updated", error);
    },
  });
};
