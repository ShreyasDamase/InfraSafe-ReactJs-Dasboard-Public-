import { autologUser } from "@/api/autologUser";
import { useQuery } from "@tanstack/react-query";

interface ValidatedTokenResponse {
  success?: boolean; // optional if backend doesn’t send this always
  uid?: string;
  phoneNumber?: string;
  message: string;
  user: any;
}

export const useAutoLogin = () => {
  console.log("hook data");
  return useQuery<ValidatedTokenResponse, Error>({
    queryKey: ["admin-auto-login"],
    queryFn: autologUser,
    retry: false, // optional: disable retry for auth
    refetchOnWindowFocus: false,
  });
};
