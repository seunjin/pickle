import type { SVGProps } from "react";
import type { ICON_PALETTE } from "../icons";

// [1] 컴포넌트 타입 정의 (이미 파일 상단에 import 되어 있다고 가정)
type PaletteComponent = React.ComponentType<SVGProps<SVGSVGElement>>;

// [2] 결과물의 타입을 정확히 추론하는 유틸리티 타입 (이전과 동일)
type PaletteBySize<S extends string> = {
  [K in keyof typeof ICON_PALETTE as S extends keyof (typeof ICON_PALETTE)[K]
    ? K
    : never]: S extends keyof (typeof ICON_PALETTE)[K]
    ? { [SizeKey in S]: (typeof ICON_PALETTE)[K][SizeKey] }
    : never;
};

// [3] 팔레트 생성 함수
export const createPalette = <S extends string>(
  size: S,
  palette: typeof ICON_PALETTE,
): PaletteBySize<S> => {
  // 1. 빈 객체를 최종 타입으로 단언하여 생성 (초기화)
  const result = {} as PaletteBySize<S>;

  // 2. 팔레트의 키를 순회
  (Object.keys(palette) as Array<keyof typeof ICON_PALETTE>).forEach((key) => {
    const iconSet = palette[key];

    // 3. 해당 사이즈가 있는지 체크 (Object.prototype.hasOwnProperty 사용이 안전함)
    if (Object.hasOwn(iconSet, size)) {
      // 4. 값을 꺼낼 때 'Record<string, ...>'로 좁혀서 접근 (any 방지)
      const component = (iconSet as Record<string, PaletteComponent>)[size];

      // 5. 새로운 구조 { size: component } 생성 후 할당
      // Object.assign을 사용하면 result의 타입을 유지하면서 값을 넣기 편합니다.
      Object.assign(result, {
        [key]: {
          [size]: component,
        },
      });
    }
  });

  return result;
};
