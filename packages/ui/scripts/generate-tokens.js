const fs = require("node:fs");
const path = require("node:path");

const TOKEN_PATH = path.join(__dirname, "../src/token.json");
const OUTPUT_PATH = path.join(__dirname, "../src/token.css");

// Hex to OKLCH Conversion Logic
function hexToOklch(hex) {
  // Remove # and handle incomplete hex
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse sRGB
  const r_sr = parseInt(hex.substring(0, 2), 16) / 255;
  const g_sr = parseInt(hex.substring(2, 4), 16) / 255;
  const b_sr = parseInt(hex.substring(4, 6), 16) / 255;

  // sRGB -> Linear sRGB
  const toLinear = (c) =>
    c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
  const r = toLinear(r_sr);
  const g = toLinear(g_sr);
  const b = toLinear(b_sr);

  // Linear sRGB -> OKLab (via LMS)
  // 1. Linear sRGB to LMS
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  // 2. LMS Non-linearity
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // 3. LMS to OKLab
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const C1 = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_; // a (in Lab)
  const C2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_; // b (in Lab)

  // OKLab -> OKLCH
  const Chroma = Math.sqrt(C1 * C1 + C2 * C2);
  let Hue = Math.atan2(C2, C1) * (180 / Math.PI);

  if (Hue < 0) Hue += 360;

  // Formatting (5 decimals for precision, similar to standard tools)
  const fmt = (n) => parseFloat(n.toFixed(5));

  // Handle near-zero chroma to avoid hue noise (though not strictly necessary for CSS, implies cleaner output)
  if (Chroma < 0.0001) Hue = 0;

  return `oklch(${fmt(L)} ${fmt(Chroma)} ${fmt(Hue)})`;
}

function generateTokens() {
  try {
    const rawData = fs.readFileSync(TOKEN_PATH, "utf8");
    const tokens = JSON.parse(rawData);

    let cssContent =
      "/* Generated from token.json */\n/* Format: oklch(L C H) */\n\n";

    const processTokens = (obj) => {
      let content = "";
      for (const [key, valueObj] of Object.entries(obj)) {
        if (valueObj.$value) {
          const oklchValue = hexToOklch(valueObj.$value);
          content += `  --${key}: ${oklchValue};\n`;
        }
      }
      return content;
    };

    // 1. Light Mode (:root)
    if (tokens.light) {
      cssContent += ":root {\n";
      cssContent += processTokens(tokens.light);
      cssContent += "}\n\n";
    }

    // 2. Dark Mode (.dark)
    if (tokens.dark) {
      cssContent += ".dark {\n";
      cssContent += processTokens(tokens.dark);
      cssContent += "}\n";
    }

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
