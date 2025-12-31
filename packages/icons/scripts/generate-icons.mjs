import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 패키지 루트 기준 경로 설정
const PACKAGE_ROOT = path.resolve(__dirname, "..");
const SVG_DIR = path.resolve(PACKAGE_ROOT, "src/svg");
const REACT_DIR = path.resolve(PACKAGE_ROOT, "src/react");
const ICONS_PATH = path.resolve(PACKAGE_ROOT, "src/icons.ts");

async function generate() {
  await fs.mkdir(REACT_DIR, { recursive: true });
  const files = await fs.readdir(SVG_DIR);
  const svgFiles = files.filter((f) => f.endsWith(".svg"));

  console.log(
    `🚀 Found ${svgFiles.length} SVG files in ${SVG_DIR}. Starting transformation via CLI...`,
  );

  const svgMetadata = [];

  try {
    // 1. SVG 파일 분석 및 메타데이터 생성
    for (const file of svgFiles) {
      const baseName = path.basename(file, ".svg"); // 예: note_full-20
      const dashIndex = baseName.lastIndexOf("-");

      if (dashIndex === -1) {
        console.warn(
          `⚠️  파일 형식이 올바르지 않습니다 (예: name-20.svg): ${file}`,
        );
        continue;
      }

      const namePart = baseName.slice(0, dashIndex); // note_full
      const sizePart = baseName.slice(dashIndex + 1); // 20
      const componentName = `Icon${path
        .basename(file, ".svg")
        .split(/[-_]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("")}`;

      // 플랫 키: note_full_20
      const flatKey = `${namePart}_${sizePart}`;

      svgMetadata.push({
        file,
        name: namePart,
        size: sizePart,
        flatKey,
        componentName,
      });
    }

    // --filename-case pascal: 파일명을 PascalCase로 (예: Search20.tsx)
    // --expand-props end: props 전달 가능하게
    // --icon: width/height를 1em으로 설정
    // --jsx-runtime automatic: React 17+ 의 자동 JSX 트랜스폼 사용 (명시적 React 임포트 제거)
    execSync(
      `npx @svgr/cli --out-dir ${REACT_DIR} --typescript --icon --expand-props end --jsx-runtime automatic --filename-case pascal --replace-attr-values "#898989=currentColor,#000=currentColor,black=currentColor" ${SVG_DIR}`,
      { stdio: "inherit" },
    );

    // 2. 생성된 파일들 리네임 및 불필요한 인덱스 제거
    const generatedRawFiles = await fs.readdir(REACT_DIR);
    for (const file of generatedRawFiles) {
      if (file === "index.ts" || file === "index.tsx") {
        await fs.unlink(path.join(REACT_DIR, file));
        continue;
      }

      const baseName = path.basename(file, ".tsx"); // 예: NoteFull20
      if (file.endsWith(".tsx") && !file.startsWith("Icon")) {
        const metadata = svgMetadata.find(
          (m) => m.componentName === `Icon${baseName}`,
        );
        const finalName = metadata
          ? `${metadata.componentName}.tsx`
          : `Icon${file}`;

        await fs.rename(
          path.join(REACT_DIR, file),
          path.join(REACT_DIR, finalName),
        );

        // 3. 고정 Title 삽입 로직 (Biome 린트 에러 해결 및 접근성)
        const filePath = path.join(REACT_DIR, finalName);
        const componentName = path.basename(finalName, ".tsx");
        let content = await fs.readFile(filePath, "utf-8");

        // <svg ... > 태그를 찾아 그 바로 뒤에 <title>삽입
        content = content.replace(
          /(<svg[^>]*>)/,
          `$1\n    <title>${componentName}</title>`,
        );
        await fs.writeFile(filePath, content);
      }
    }
  } catch (error) {
    console.error("❌ SVGR CLI failed or post-processing failed:", error);
    process.exit(1);
  }

  const _processedFiles = await fs.readdir(REACT_DIR);
  const imports = [];
  const componentExports = [];
  const paletteEntries = [];

  for (const meta of svgMetadata) {
    const { flatKey, componentName } = meta;

    // 파일이 실제로 존재하는지 확인 (리네임 단계에서 생성됨)
    const filePath = path.join(REACT_DIR, `${componentName}.tsx`);
    try {
      await fs.access(filePath);

      imports.push(`import ${componentName} from "./react/${componentName}";`);
      componentExports.push(componentName);

      // 플랫 키 형태로 팔레트 엔트리 생성
      paletteEntries.push(`  ${flatKey}: ${componentName}`);
    } catch (_e) {
      console.warn(`⚠️  컴포넌트 파일을 찾을 수 없습니다: ${filePath}`);
    }
  }

  const iconsContent = `
${imports.join("\n")}

export {
  ${componentExports.join(",\n  ")}
};

export const ICON_PALETTE = {
${paletteEntries.join(",\n")}
} as const;

export type IconName = keyof typeof ICON_PALETTE;
`;

  await fs.writeFile(ICONS_PATH, `${iconsContent.trim()}\n`);

  console.log(`✨ All icons generated and ${ICONS_PATH} updated!`);

  // Biome 적용으로 불필요한 diff 방지
  console.log("🎨 Running Biome format on generated files...");
  try {
    execSync(
      `npx @biomejs/biome format --write "${REACT_DIR}" "${ICONS_PATH}"`,
      {
        stdio: "inherit",
      },
    );
  } catch (_error) {
    console.warn("⚠️  Biome execution failed, but icons were generated.");
  }
}

generate().catch(console.error);
