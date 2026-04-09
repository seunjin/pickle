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
  const [visibleCount, setVisibleCount] = useState<number>(tags.length);
  const [overflowCount, setOverflowCount] = useState<number>(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const TAG_GAP = 4;
    const COUNTER_GAP = 8;
    const TAG_HORIZONTAL_PADDING = 14;
    const TAG_BORDER_WIDTH = 2;
    const TAG_CHROME_WIDTH = TAG_HORIZONTAL_PADDING + TAG_BORDER_WIDTH;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    const calculateOverflow = () => {
      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;

      const computedStyle = getComputedStyle(container);
      const fontFamily = computedStyle.fontFamily || "sans-serif";

      const measureTextWidth = (text: string, fontWeight = "400") => {
        context.font = `${fontWeight} 12px ${fontFamily}`;
        return Math.ceil(context.measureText(text).width);
      };

      const tagWidths = tags.map(
        (tag) => measureTextWidth(`#${tag.name}`) + TAG_CHROME_WIDTH,
      );

      let currentWidth = 0;
      let newVisibleCount = 0;
      let hasOverflow = false;

      for (let i = 0; i < tags.length; i++) {
        const tagWidth = tagWidths[i];
        const widthWithGap =
          currentWidth + tagWidth + (newVisibleCount > 0 ? TAG_GAP : 0);
        const remainingCount = tags.length - (i + 1);
        const reservedCounterWidth =
          remainingCount > 0
            ? COUNTER_GAP + measureTextWidth(`+${remainingCount}`, "500")
            : 0;

        const isFirstTag = i === 0;
        const spaceNeeded = widthWithGap + reservedCounterWidth;

        if (isFirstTag || spaceNeeded <= containerWidth) {
          currentWidth = widthWithGap;
          newVisibleCount++;

          if (
            isFirstTag &&
            spaceNeeded > containerWidth &&
            remainingCount > 0
          ) {
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
    calculateOverflow();

    document.fonts?.ready.then(() => {
      calculateOverflow();
    });

    return () => resizeObserver.disconnect();
  }, [tags]);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full items-center gap-2 overflow-hidden"
    >
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
              <span className="shrink-0 cursor-pointer text-end font-medium text-[12px] text-neutral-600 hover:text-base-muted-foreground">
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
