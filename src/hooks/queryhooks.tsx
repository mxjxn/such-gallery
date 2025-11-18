import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, updateName, updateBio } from "@/app/users";

export const useProfileQuery = (address: string) => {
  const data = useQuery({
    queryKey: ["userProfile", address],
    queryFn: () => getUser(address),
  });
  return data;
};
