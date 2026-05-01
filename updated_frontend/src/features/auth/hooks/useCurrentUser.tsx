import { useAuthContext } from "@/core/providers/AuthProvider";

export function useCurrentUser() {
  return useAuthContext();
}

export default useCurrentUser;
