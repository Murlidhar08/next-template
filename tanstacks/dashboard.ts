"use client";

import { getFirstName } from "@/actions/dashboard.actions";
import { useQuery } from "@tanstack/react-query";

export const useFirstName = () => {
    return useQuery({
        queryKey: ["user-name"],
        queryFn: () => getFirstName(),
    });
};