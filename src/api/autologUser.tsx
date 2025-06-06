import axios from "axios";
import { BASE_URL } from "@/service/config";

interface ValidatedTokenResponse {
  success?: boolean; // optional if backend doesn’t send this always
  uid?: string;
  phoneNumber?: string;
  message: string;
  user: any;
}

export const autologUser = async (): Promise<ValidatedTokenResponse> => {
  const response = await axios.get<ValidatedTokenResponse>(
    `${BASE_URL}/auth/auto-login`,

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
