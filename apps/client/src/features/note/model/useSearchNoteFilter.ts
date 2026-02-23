import type { Tag } from "@pickle/contracts";
import type { SelectOption } from "@pickle/ui";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSessionContext } from "@/features/auth/model/SessionContext";
import { folderQueries } from "@/features/folder/model/folderQueries";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { createClient } from "@/shared/lib/supabase";

interface UseSearchNoteFilterProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
}

/**
 * SearchNoteFilter 컴포넌트의 비즈니스 로직을 관리하는 커스텀 훅
 */
export function useSearchNoteFilter({
  selectedTagIds,
  onTagsChange,
}: UseSearchNoteFilterProps) {
  const client = createClient();
  const { workspace } = useSessionContext();
  const workspaceId = workspace?.id;

  const [tagFilterOpen, setTagFilterOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  // 다중 쿼리 병렬 처리 (Waterfall 방지)
  const results = useQueries({
    queries: [
      {
        ...folderQueries.list(client),
      },
      {
        ...tagQueries.list({ client, workspaceId }),
        enabled: !!workspaceId,
      },
    ],
  });

  const [{ data: folders = [] }, { data: tags = [] }] = results as [
    { data: { id: string; name: string; totalCount: number }[] },
    { data: Tag[] },
  ];

  // 폴더 옵션 구성
  const folderOptions = useMemo<SelectOption[]>(() => {
    const defaultOptions: SelectOption[] = [
      { value: "all", label: "All Folders" },
      { value: "inbox", label: "Inbox" },
    ];

    const folderItems = folders.map((f) => ({
      value: f.id,
      label: f.name,
    }));

    return [...defaultOptions, ...folderItems];
  }, [folders]);

  // 검색 필터링된 태그 목록
  const filteredTags = useMemo<Tag[]>(() => {
    if (!search) return tags;
    const lowerSearch = search.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(lowerSearch));
  }, [tags, search]);

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  return {
    tags,
    folderOptions,
    filteredTags,
    tagFilterOpen,
    setTagFilterOpen,
    search,
    setSearch,
    handleTagToggle,
  };
}
