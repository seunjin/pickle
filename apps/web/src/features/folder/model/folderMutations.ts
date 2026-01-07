import type {
  CreateFolderDto,
  UpdateFolderDto,
} from "@pickle/contracts/src/folder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { createFolder } from "../api/createFolder";
import { deleteFolder } from "../api/deleteFolder";
import { updateFolder } from "../api/updateFolder";
import { folderKeys } from "./folderQueries";

export function useCreateFolder(workspaceId: string) {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: (input: CreateFolderDto) =>
      createFolder({ client, input, workspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.list() });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: ({
      folderId,
      input,
    }: {
      folderId: string;
      input: UpdateFolderDto;
    }) => updateFolder({ client, folderId, input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.list() });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteFolder({ client, folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.list() });
    },
  });
}
