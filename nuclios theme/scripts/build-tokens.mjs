// Generates tokens/nuclios.css from tokens/bento-variables.json
// (the variable export of the Figma "Bento UI Library V2.0" file).
//
//   node "nuclios theme/scripts/build-tokens.mjs"
//
// Re-run after refreshing bento-variables.json from Figma. Never hand-edit nuclios.css.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const collections = JSON.parse(readFileSync(join(root, "tokens/bento-variables.json"), "utf8"));
const byName = Object.fromEntries(collections.map((c) => [c.c, c]));

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/@/g, "")
    .replace(/%/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ---------- 1. Variable name → CSS custom property name, per collection ---------- */
const naming = {
  "Colour: Primitives": (n) => `--nuclios-${slug(n)}`,
  "Colour: Anchors": (n) => `--nuclios-anchor-${slug(n)}`,
  "Colour: Semantics": (n) => `--color-${slug(n)}`,
  Unit: (n) => `--unit-${slug(n.replace("Unit/", ""))}`,
  Spacing: (n) => `--spacing-${slug(n.replace("Space/", ""))}`,
  "Border: Primitives": (n) =>
    n.startsWith("border radius")
      ? `--radius-primitive-${slug(n.split("/")[1])}`
      : n.startsWith("Border Width")
        ? `--border-width-${slug(n.split("/")[1])}`
        : null,
  "Type: Primitives": (n) => {
    const [group, key] = n.split("/");
    return `--${slug(group === "Family" ? "font-family" : group === "Weight" ? "font-weight" : group)}-${slug(key)}`;
  },
  "Type: Semantics": (n) => `--type-${slug(n)}`,
  Shadows: (n) => `--shadow-${slug(n.replace(/^Shadow /, ""))}`,
  Breakpoints: (n) => `--layout-${slug(n)}`,
  "Border Radius: Semantics": (n) => `--radius-${slug(n)}`,
};

const varOf = {}; // Figma variable name → css var (aliases reference names only)
for (const c of collections) {
  const fn = naming[c.c];
  for (const [name] of c.v) {
    const css = fn(name);
    if (css && !(name in varOf)) varOf[name] = css;
  }
}

/* ---------- 2. Value formatting ---------- */
const WEIGHTS = { Light: 300, "Light Italic": 300, Regular: 400, Medium: 500, Bold: 700 };
const UNITLESS = /columns$/;

function value(collection, name, raw) {
  if (typeof raw === "string" && raw.startsWith("@")) {
    const target = varOf[raw.slice(1)];
    if (!target) throw new Error(`Unresolved alias ${raw} in ${name}`);
    return `var(${target})`;
  }
  if (typeof raw === "number") {
    if (UNITLESS.test(name)) return String(raw);
    return `${raw}px`;
  }
  if (collection === "Type: Primitives" && name.startsWith("Family/"))
    return `"${raw}", "Inter", system-ui, sans-serif`;
  if (collection === "Type: Primitives" && name.startsWith("Weight/"))
    return String(WEIGHTS[raw] ?? 400);
  return raw;
}

function block(selector, entries, comment) {
  const lines = entries.filter(Boolean).map(([k, v]) => `  ${k}: ${v};`);
  if (!lines.length) return "";
  return `${comment ? `/* ${comment} */\n` : ""}${selector} {\n${lines.join("\n")}\n}\n`;
}

function entriesFor(collectionName, modeIndex, onlyChangedFrom) {
  const c = byName[collectionName];
  const fn = naming[collectionName];
  return c.v
    .map(([name, ...modes]) => {
      const css = fn(name);
      if (!css) return null;
      if (onlyChangedFrom !== undefined && modes[modeIndex] === modes[onlyChangedFrom]) return null;
      return [css, value(collectionName, name, modes[modeIndex])];
    })
    .filter(Boolean);
}

/* ---------- 3. Composite tokens built from the parts ---------- */
function shadows() {
  const out = [];
  for (let i = 1; i <= 10; i++) {
    const layers = ["sd-01", "sd-02", "sd-03"]
      .filter((l) => varOf[`Shadow ${i}/${l}/x`])
      .map((l) =>
        ["x", "y", "blur", "spread", "color"]
          .map((p) => `var(${varOf[`Shadow ${i}/${l}/${p}`]})`)
          .join(" ")
      );
    out.push([`--shadow-${i}`, layers.join(", ")]);
  }
  return out;
}

function typeStyles() {
  const styles = new Set(
    byName["Type: Semantics"].v.map(([n]) => n.split("/").slice(0, -1).join("/"))
  );
  return [...styles]
    .map((s) => {
      const p = (k) => `var(${varOf[`${s}/${k}`]})`;
      const italic = s.includes("Italic") ? "\n  font-style: italic;" : "";
      return `.nuclios-type-${slug(s)} {\n  font-family: ${p("Family")};\n  font-weight: ${p("Weight")};\n  font-size: ${p("Size")};\n  line-height: ${p("Line Height")};\n  letter-spacing: ${p("Letter Spacing")};${italic}\n}`;
    })
    .join("\n");
}

/* Tokens referenced by Bento components but not defined as local variables in the file. */
const extras = [
  ["--color-background-kpi", "var(--color-surface-surface-1)"],
  ["--color-surface-surface-3", "var(--color-surface-surface-2)"],
];

/* ---------- 4. Assemble ---------- */
const T = ".theme-nuclios";
const primitiveModes = byName["Colour: Primitives"].modes; // NucliOS, GOOD_YEAR, MARS
const radiusModes = byName["Border Radius: Semantics"].modes; // Default, Square, Round 1–4
const bpModes = byName["Breakpoints"].modes; // 1920, 1366, 1280, 768, 440
const bpQueries = { 1366: 1600, 1280: 1365, 768: 1279, 440: 767 };

let css = `/* ================================================================
   NucliOS theme — GENERATED from Figma "Bento UI Library V2.0"
   (file 3bOXGFIhjnHPqaJwqva2n8). Do not edit by hand:
   update tokens/bento-variables.json and run scripts/build-tokens.mjs.

   Activate:   <html class="theme-nuclios">            light
               <html class="theme-nuclios dark">       dark
   Brand mode: add brand-good-year | brand-mars        (same element)
   Radius:     add radius-square | radius-round-1..4   (same element or any descendant)
   ================================================================ */

`;

css += block(
  T,
  [
    ...entriesFor("Unit", 0),
    ...entriesFor("Colour: Primitives", 0),
    ...entriesFor("Spacing", 0),
    ...entriesFor("Border: Primitives", 0),
    ...entriesFor("Border Radius: Semantics", 0),
    ...entriesFor("Type: Primitives", 0),
    ...entriesFor("Type: Semantics", 0),
    ...entriesFor("Shadows", 0),
    ...shadows(),
    ...entriesFor("Breakpoints", 0),
    ...entriesFor("Colour: Anchors", 0),
    ...entriesFor("Colour: Semantics", 0),
    ...extras,
    ["font-family", "var(--font-family-graphik)"],
    ["color", "var(--color-text-neutral)"],
    ["background-color", "var(--color-background-neutral)"],
  ],
  "Base: NucliOS brand · Light · Default radius · 1920 layout"
);

css +=
  "\n" +
  block(
    `.dark ${T},\n${T}.dark`,
    [...entriesFor("Colour: Anchors", 1), ...entriesFor("Colour: Semantics", 1)],
    "Dark mode"
  );

primitiveModes.slice(1).forEach((m, i) => {
  css +=
    "\n" +
    block(`${T}.brand-${slug(m)}`, entriesFor("Colour: Primitives", i + 1, 0), `Brand mode: ${m}`);
});

radiusModes.slice(1).forEach((m, i) => {
  css +=
    "\n" +
    block(
      `${T}.radius-${slug(m)},\n${T} .radius-${slug(m)}`,
      entriesFor("Border Radius: Semantics", i + 1, 0),
      `Radius mode: ${m}`
    );
});

bpModes.slice(1).forEach((m, i) => {
  const inner = block(T, entriesFor("Breakpoints", i + 1, 0))
    .replace(/^/gm, "  ")
    .trimEnd();
  css += `\n/* Layout mode: ${m} */\n@media (max-width: ${bpQueries[m]}px) {\n${inner}\n}\n`;
});

css += `\n/* Typography styles (Type: Semantics) */\n${typeStyles()}\n`;

writeFileSync(join(root, "tokens/nuclios.css"), css);
const count = collections.reduce((n, c) => n + c.v.length, 0);
console.log(`nuclios.css written — ${count} Figma variables, ${css.length} bytes`);
