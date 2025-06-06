import { useQuery } from "@tanstack/react-query";
import { getComplaint } from "../api/getComplaint";

export const useGetComplaint = (zoneName: string) => {
    return useQuery({
        queryKey: ["get-complaint", zoneName], // pass zoneName in the key
        queryFn: ({ queryKey }) => {
            const [, zoneName] = queryKey; // destructure zoneName
            return getComplaint({ zoneName }); // pass to API
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
};
