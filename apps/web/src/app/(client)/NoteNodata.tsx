export type NodataType = "default" | "bookmarks" | "trash" | "search";

interface NoteNodataProps {
  type: NodataType;
}
export function NoteNodata({ type = "default" }: NoteNodataProps) {
  const Content = () => {
    switch (type) {
      case "default":
        return (
          <div className="flex flex-col items-center">
            <img
              src={`/nodata-${type}.svg`}
              alt={`nodata-${type}`}
              className="mb-6 size-[38px]"
            />
            <p className="pb-2 text-[15px] text-neutral-300 leading-none">
              아직 저장된 노트가 없어요 🙂
            </p>
            <p className="text-[15px] text-neutral-500 leading-none">
              웹에서 마음에 드는 내용을 바로 모아보세요.
            </p>
          </div>
        );
      case "bookmarks":
        return (
          <div className="flex flex-col items-center">
            <img
              src={`/nodata-${type}.svg`}
              alt={`nodata-${type}`}
              className="mb-6 size-[38px]"
            />
            <p className="pb-2 text-[15px] text-neutral-300 leading-none">
              아직 북마크가 없어요 🙂
            </p>
            <p className="text-[15px] text-neutral-500 leading-none">
              자주 보는 노트는 북마크로 저장해보세요.
            </p>
          </div>
        );
      case "trash":
        return (
          <div className="flex flex-col items-center">
            <img
              src={`/nodata-${type}.svg`}
              alt={`nodata-${type}`}
              className="mb-6 size-[38px]"
            />
            <p className="pb-2 text-[15px] text-neutral-300 leading-none">
              휴지통이 비어 있어요 🙂
            </p>
            <p className="text-[15px] text-neutral-500 leading-none">
              여기서 노트를 다시 복구할 수 있어요.
            </p>
          </div>
        );
      case "search":
        return (
          <div className="flex flex-col items-center">
            <img
              src="/nodata-default.svg"
              alt="nodata-search"
              className="mb-6 size-[38px]"
            />
            <p className="pb-2 text-[15px] text-neutral-300 leading-none">
              검색 결과가 없어요 🙂
            </p>
            <p className="text-[15px] text-neutral-500 leading-none">
              다른 검색어나 필터를 사용해 보세요.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center pb-(--web-header-height)">
      <Content />
    </div>
  );
}
