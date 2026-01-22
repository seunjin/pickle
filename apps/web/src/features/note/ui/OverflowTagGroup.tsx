"use client";

import type { Tag } from "@pickle/contracts/src/tag";
import {
  OriginTooltip,
  OriginTooltipContent,
  OriginTooltipTrigger,
  TAG_VARIANTS,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useLayoutEffect, useRef, useState } from "react";

interface OverflowTagGroupProps {
  tags: Tag[];
}

export function OverflowTagGroup({ tags }: OverflowTagGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);

  const [visibleCount, setVisibleCount] = useState<number>(tags.length);
  const [overflowCount, setOverflowCount] = useState<number>(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateOverflow = () => {
      const containerWidth = container.offsetWidth;
      const gap = 8; // gap-2 = 8px
      const counterWidth = counterRef.current?.offsetWidth || 30; // "+N" 예상 너비

      let currentWidth = 0;
      let newVisibleCount = 0;
      let hasOverflow = false;

      for (let i = 0; i < tags.length; i++) {
        const tagElement = tagRefs.current[i];
        if (!tagElement) continue;

        const tagWidth = tagElement.offsetWidth;
        const widthWithGap =
          currentWidth + tagWidth + (newVisibleCount > 0 ? gap : 0);

        // 첫 번째 태그는 무조건 포함하지만, 2개 이상의 태그가 있을 때는 카운터 공간을 미리 고려합니다.
        const isFirstTag = i === 0;
        const spaceNeeded =
          widthWithGap + (i < tags.length - 1 ? gap + counterWidth : 0);

        if (isFirstTag || spaceNeeded <= containerWidth) {
          currentWidth = widthWithGap;
          newVisibleCount++;

          // 첫 번째 태그가 길어서 이미 공간을 다 차지했고 뒤에 태그가 더 있다면 오버플로우로 간주
          if (isFirstTag && spaceNeeded > containerWidth && tags.length > 1) {
            hasOverflow = true;
            break;
          }
        } else {
          hasOverflow = true;
          break;
        }
      }

      if (!hasOverflow && newVisibleCount === tags.length) {
        setVisibleCount(tags.length);
        setOverflowCount(0);
      } else {
        setVisibleCount(newVisibleCount);
        setOverflowCount(tags.length - newVisibleCount);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      calculateOverflow();
    });

    resizeObserver.observe(container);
    calculateOverflow(); // 초기 계산

    return () => resizeObserver.disconnect();
  }, [tags]);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full items-center gap-2 overflow-hidden"
    >
      {/* 측정을 위해 숨겨진 모든 태그 */}
      <div className="invisible absolute flex gap-2 whitespace-nowrap">
        {tags.map((tag, index) => {
          const style = TAG_VARIANTS[tag.style as keyof typeof TAG_VARIANTS];
          return (
            <span
              key={`measure-${tag.id}`}
              ref={(el) => {
                tagRefs.current[index] = el;
              }}
              className={cn(
                "inline-flex h-[22px] items-center gap-1 rounded-[4px] border px-[7px] text-[12px]",
                style.paletteColor,
                style.tagColor,
              )}
            >
              #{tag.name}
            </span>
          );
        })}
        <span ref={counterRef} className="font-medium text-[12px]">
          +99
        </span>
      </div>

      {/* 실제 노출되는 태그 */}
      <div
        className={cn(
          "grid w-full items-center gap-2",
          overflowCount > 0 ? "grid-cols-[auto_1fr]" : "grid-cols-1",
        )}
      >
        <div className="flex min-w-0 items-center gap-1">
          {tags.slice(0, visibleCount).map((tag, index) => {
            const style = TAG_VARIANTS[tag.style as keyof typeof TAG_VARIANTS];
            const isFirst = index === 0;
            return (
              <div
                key={tag.id}
                className={cn(
                  "flex h-[22px] items-center rounded-[4px] border px-[7px] text-[12px]",
                  isFirst ? "min-w-0 shrink" : "shrink-0",
                  style.paletteColor,
                  style.tagColor,
                )}
              >
                <div className="truncate">#{tag.name}</div>
              </div>
            );
          })}
        </div>
        {overflowCount > 0 && (
          <OriginTooltip>
            <OriginTooltipTrigger asChild>
              <span className="shrink-0 cursor-pointer font-medium text-[12px] text-neutral-600 hover:text-base-muted-foreground">
                +{overflowCount}
              </span>
            </OriginTooltipTrigger>
            <OriginTooltipContent
              side="bottom"
              align="start"
              sideOffset={5}
              className="flex flex-wrap gap-1 border border-base-border-light bg-base-foreground-background p-[5px] shadow-standard"
              style={{ maxWidth: `${containerRef.current?.offsetWidth}px` }}
            >
              {tags.slice(visibleCount).map((tag) => {
                const style =
                  TAG_VARIANTS[tag.style as keyof typeof TAG_VARIANTS];
                return (
                  <div
                    key={tag.id}
                    className={cn(
                      "flex h-[22px] min-w-0 items-center rounded-[4px] border px-[7px]",
                      style.paletteColor,
                      style.tagColor,
                    )}
                  >
                    <span className="block truncate text-[12px]">
                      #{tag.name}
                    </span>
                  </div>
                );
              })}
            </OriginTooltipContent>
          </OriginTooltip>
        )}
      </div>
    </div>
  );
}
