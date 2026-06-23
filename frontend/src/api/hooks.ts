import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import type {
  Project,
  ProjectDetail,
  Device,
  DeviceLink,
  AddressEntry,
  ProjectConfigOut,
  CreateProjectPayload,
  CreateDevicePayload,
  CreateLinkPayload,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/types";

// ── Projects ──────────────────────────────────────────────────────────────────
export const useProjects = () =>
  useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => (await apiClient.get("/api/projects/")).data,
  });

export const useProject = (id: number) =>
  useQuery<ProjectDetail>({
    queryKey: ["projects", id],
    queryFn: async () => (await apiClient.get(`/api/projects/${id}`)).data,
    enabled: !!id,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      apiClient.post<Project>("/api/projects/", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

// ── Devices ───────────────────────────────────────────────────────────────────
export const useCreateDevice = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDevicePayload) =>
      apiClient
        .post<Device>(`/api/projects/${projectId}/devices/`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

export const useUpdateDevice = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<CreateDevicePayload> & { id: number }) =>
      apiClient
        .put<Device>(`/api/projects/${projectId}/devices/${id}`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

export const useDeleteDevice = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: number) =>
      apiClient.delete(`/api/projects/${projectId}/devices/${deviceId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

// ── Links ─────────────────────────────────────────────────────────────────────
export const useCreateLink = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLinkPayload) =>
      apiClient
        .post<DeviceLink>(`/api/projects/${projectId}/devices/links/`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

export const useDeleteLink = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: number) =>
      apiClient.delete(`/api/projects/${projectId}/devices/links/${linkId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

// ── Addresses ─────────────────────────────────────────────────────────────────
export const useCreateAddress = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      apiClient
        .post<AddressEntry>(`/api/projects/${projectId}/addresses/`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

export const useBulkCreateAddresses = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressPayload[]) =>
      apiClient
        .post<AddressEntry[]>(`/api/projects/${projectId}/addresses/bulk`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

export const useUpdateAddress = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateAddressPayload & { id: number }) =>
      apiClient
        .put<AddressEntry>(`/api/projects/${projectId}/addresses/${id}`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

export const useDeleteAddress = (projectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: number) =>
      apiClient.delete(`/api/projects/${projectId}/addresses/${entryId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
};

// ── Configs ───────────────────────────────────────────────────────────────────
export const useProjectConfigs = (projectId: number) =>
  useQuery<ProjectConfigOut>({
    queryKey: ["configs", projectId],
    queryFn: async () =>
      (await apiClient.get(`/api/projects/${projectId}/configs/`)).data,
    enabled: !!projectId,
  });

// ── Export ────────────────────────────────────────────────────────────────────
export const downloadExport = async (projectId: number, format: "pdf" | "docx") => {
  const response = await apiClient.get(`/api/projects/${projectId}/export/${format}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `netdoc_project_${projectId}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};