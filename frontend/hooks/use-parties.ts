import { Party, PartyStats } from "@/hooks/types";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/error";
import { transformParties } from "@/lib/transforms";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ApiPartyItem {
  id: number;
  name: string;
  logoUrl: string | null;
  policy: string | null;
  color: string | null;
}

// Hook to fetch Party Stats (For Parties Page)
export function usePartyStats() {
  return useQuery<PartyStats[]>({
    queryKey: ["party-stats"],
    queryFn: async () => {
      const { data } = await api.get("/public/parties?limit=1000");
      return (data.data || []).map((p: ApiPartyItem) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logoUrl,
        logo_url: p.logoUrl,
        policy: p.policy,
        color: p.color,
        mpCount: 0, // Placeholder
      }));
    },
  });
}

// Hook to fetch Parties (Management)
export function useParties() {
  return useQuery<Party[]>({
    queryKey: ["parties"],
    queryFn: async () => {
      const { data } = await api.get("/ec/parties?limit=1000");
      return transformParties(data.data || []) as Party[];
    },
  });
}

export interface PartyPayload {
  name: string;
  logo_url: string;
  policy: string;
  color: string;
}

export function useCreatePartyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PartyPayload) => {
      const apiPayload = {
        name: payload.name,
        logoUrl: payload.logo_url,
        policy: payload.policy,
        color: payload.color,
      };
      await api.post("/ec/parties", apiPayload);
    },
    onSuccess: () => {
      toast.success("เพิ่มพรรคสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ec-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "เพิ่มพรรคไม่สำเร็จ"));
    },
  });
}

export function useUpdatePartyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: PartyPayload;
    }) => {
      const apiPayload = {
        name: payload.name,
        logoUrl: payload.logo_url,
        policy: payload.policy,
        color: payload.color,
      };
      await api.put(`/ec/parties/${id}`, apiPayload);
    },
    onSuccess: () => {
      toast.success("แก้ไขข้อมูลสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ec-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "แก้ไขไม่สำเร็จ"));
    },
  });
}

export function useDeletePartyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ec/parties/${id}`);
    },
    onSuccess: () => {
      toast.success("ลบพรรคสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ec-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "ลบไม่สำเร็จ"));
    },
  });
}
