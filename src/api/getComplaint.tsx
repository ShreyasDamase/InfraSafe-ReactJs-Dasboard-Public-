import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/service/config";

interface ValidatedTokenResponse {
  success?: boolean; // optional if backend doesn’t send this always
  uid?: string;
  phoneNumber?: string;
  message: string;
  user: any;
}
interface ValidatedTokenPayload {
  zoneName: string;
}

export const getComplaint = async (
  payload: ValidatedTokenPayload
): Promise<ValidatedTokenResponse> => {
  const response = await axios.get<ValidatedTokenResponse>(
    `${BASE_URL}/complaint/complaint`,
    {
      params: payload,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("here response", response.data);
  return response.data;
};
