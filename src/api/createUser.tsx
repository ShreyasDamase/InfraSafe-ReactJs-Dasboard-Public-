import axios from "axios";
import { BASE_URL } from "@/service/config";

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

export const createUser = async (
  payload: ValidatedTokenPayload
): Promise<ValidatedTokenResponse> => {
  console.log("inside api", payload);

  const response = await axios.post<ValidatedTokenResponse>(
    `${BASE_URL}/auth/verify-token`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  console.log("here response", response.data);

  return response.data;
};
