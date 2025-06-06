import { createUser } from "@/api/createUser";
import { useMutation } from "@tanstack/react-query";

interface ValidatedTokenResponse {
  success?: boolean; // optional if backend doesn’t send this always
  uid?: string;
  phoneNumber?: string;
  message: string;
  user: any;
}
interface UserData {
  userId: string;
  phone: string;
  password: string;
  role: string;
}
interface ValidatedTokenPayload {
  idToken: string;
  data: UserData;
}

export const useLogin = () => {
  return useMutation<ValidatedTokenResponse, Error, ValidatedTokenPayload>({
    mutationFn: createUser,
  });
};
