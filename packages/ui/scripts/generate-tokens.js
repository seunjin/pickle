const fs = require("node:fs");
const path = require("node:path");

const TOKEN_PATH = path.join(__dirname, "../src/token.json");
const OUTPUT_PATH = path.join(__dirname, "../src/token.css");

/**
 * Hex 색상을 OKLCH로 변환
 */
function hexToOklch(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r_sr = parseInt(hex.substring(0, 2), 16) / 255;
  const g_sr = parseInt(hex.substring(2, 4), 16) / 255;
  const b_sr = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c) =>
    c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
  const r = toLinear(r_sr);
  const g = toLinear(g_sr);
  const b = toLinear(b_sr);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const C1 = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const C2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const Chroma = Math.sqrt(C1 * C1 + C2 * C2);
  let Hue = Math.atan2(C2, C1) * (180 / Math.PI);

  if (Hue < 0) Hue += 360;
  if (Chroma < 0.0001) Hue = 0;

  const fmt = (n) => parseFloat(n.toFixed(5));
  return `oklch(${fmt(L)} ${fmt(Chroma)} ${fmt(Hue)})`;
}

/**
 * rgba() 문자열을 OKLCH로 변환
 */
function rgbaToOklch(rgbaStr) {
  const match = rgbaStr.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
  );
  if (!match) return rgbaStr;

  const [, rStr, gStr, bStr, aStr] = match;
  const r_sr = parseInt(rStr, 10) / 255;
  const g_sr = parseInt(gStr, 10) / 255;
  const b_sr = parseInt(bStr, 10) / 255;
  const alpha = aStr !== undefined ? parseFloat(aStr) : 1;

  const toLinear = (c) =>
    c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
  const r = toLinear(r_sr);
  const g = toLinear(g_sr);
  const b = toLinear(b_sr);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const C1 = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const C2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const Chroma = Math.sqrt(C1 * C1 + C2 * C2);
  let Hue = Math.atan2(C2, C1) * (180 / Math.PI);

  if (Hue < 0) Hue += 360;
  if (Chroma < 0.0001) Hue = 0;

  const fmt = (n) => parseFloat(n.toFixed(5));

  if (alpha < 1) {
    return `oklch(${fmt(L)} ${fmt(Chroma)} ${fmt(Hue)} / ${alpha})`;
  }
  return `oklch(${fmt(L)} ${fmt(Chroma)} ${fmt(Hue)})`;
}

/**
 * Primitive 토큰들을 평평한 맵으로 추출
 * 키는 참조 형식(gray.neutral-950), 값은 CSS 변수명(--color-neutral-950)
 */
function buildPrimitiveRefMap(primitiveObj) {
  const map = {};
  for (const [groupName, group] of Object.entries(primitiveObj)) {
    for (const [tokenName, tokenValue] of Object.entries(group)) {
      if (tokenValue.$value) {
        // 참조 키: "gray.neutral-950"
        const refKey = `${groupName}.${tokenName}`;
        // CSS 변수명: "--color-neutral-950" (그룹명 제외, 토큰명만 사용)
        const cssVarName = `--color-${tokenName}`;
        map[refKey] = {
          cssVar: cssVarName,
          rawValue: tokenValue.$value,
        };
      }
    }
  }
  return map;
}

/**
 * 값을 CSS 값으로 변환 (hex, rgba를 oklch로)
 */
function convertRawToCssValue(value) {
  if (typeof value !== "string") return value;

  // Hex 색상
  if (value.startsWith("#")) {
    return hexToOklch(value);
  }

  // rgba() 색상
  if (value.startsWith("rgba") || value.startsWith("rgb")) {
    return rgbaToOklch(value);
  }

  return value;
}

/**
 * 참조 문법을 CSS var()로 변환
 * "{gray.neutral-950}" -> "var(--color-neutral-950)" (Primitive)
 * "{base.border}" -> "var(--color-base-border)" (Atomic)
 */
function convertRefToCssVar(value, primitiveRefMap) {
  if (typeof value !== "string") return null;

  const refMatch = value.match(/^\{(.+)\}$/);
  if (refMatch) {
    const refKey = refMatch[1];

    // 1. Primitive 참조인 경우
    const ref = primitiveRefMap[refKey];
    if (ref) {
      return `var(${ref.cssVar})`;
    }

    // 2. Atomic 참조인 경우 (예: base.border -> --color-base-border)
    const [group, token] = refKey.split(".");
    if (group && token) {
      return `var(--color-${group}-${token})`;
    }

    console.warn(`⚠️ Unresolved reference: ${value}`);
    return null;
  }
  return null;
}

/**
 * Atomic 토큰 값을 처리
 * - 참조인 경우: CSS var()로 변환
 * - 직접 값인 경우: oklch로 변환
 */
function processAtomicValue(value, primitiveRefMap) {
  // 참조인지 확인
  const cssVarRef = convertRefToCssVar(value, primitiveRefMap);
  if (cssVarRef) {
    return cssVarRef;
  }

  // 직접 값인 경우 변환
  return convertRawToCssValue(value);
}

function generateTokens() {
  try {
    const rawData = fs.readFileSync(TOKEN_PATH, "utf8");
    const tokens = JSON.parse(rawData);

    let cssContent =
      "/* Generated from token.json */\n/* Format: oklch(L C H) */\n/* Tailwind v4 compatible: @theme block */\n\n";

    // 1. Primitive 참조 맵 생성
    const primitiveRefMap = tokens.Primitive
      ? buildPrimitiveRefMap(tokens.Primitive)
      : {};

    // 2. @theme 블록 시작
    cssContent += "@theme {\n";

    // 3. Primitive 토큰 출력 (그룹명 제외, 토큰명만 사용)
    if (tokens.Primitive) {
      for (const [groupName, group] of Object.entries(tokens.Primitive)) {
        cssContent += `  /* ${groupName} */\n`;
        for (const [tokenName, tokenValue] of Object.entries(group)) {
          if (tokenValue.$value) {
            const cssValue = convertRawToCssValue(tokenValue.$value);
            // CSS 변수명: --color-{tokenName} (그룹명 제외)
            cssContent += `  --color-${tokenName}: ${cssValue};\n`;
          }
        }
        cssContent += "\n";
      }
    }

    // 4. Atomic 토큰 출력 (참조는 var()로, 직접값은 oklch로)
    if (tokens.Atomic) {
      for (const [groupName, group] of Object.entries(tokens.Atomic)) {
        cssContent += `  /* ${groupName} */\n`;
        for (const [tokenName, tokenValue] of Object.entries(group)) {
          if (tokenValue.$value) {
            const cssValue = processAtomicValue(
              tokenValue.$value,
              primitiveRefMap,
            );
            // CSS 변수명: --color-{groupName}-{tokenName}
            cssContent += `  --color-${groupName}-${tokenName}: ${cssValue};\n`;
          }
        }
        cssContent += "\n";
      }
    }

    // 5. @theme 블록 끝
    cssContent += "}\n";

    fs.writeFileSync(OUTPUT_PATH, cssContent);
    console.log(
      `✅ Tokens generated successfully at: ${OUTPUT_PATH} (Converted to OKLCH)`,
    );
  } catch (error) {
    console.error("❌ Error generating tokens:", error);
    process.exit(1);
  }
}

generateTokens();
