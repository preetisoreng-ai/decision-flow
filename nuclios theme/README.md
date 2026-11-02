# NucliOS theme

The NucliOS theme for the design system: **all 1,024 variables** and the **documented components** from the
Figma file **Bento UI Library V2.0** (`3bOXGFIhjnHPqaJwqva2n8`), built on the shared Radix + Tailwind v4
design system. The base components in `src/components/ui/` are never edited. NucliOS styling comes from
tokens, plus NucliOS components that compose those base components.

```
nuclios theme/
  tokens/
    bento-variables.json   ← raw Figma variable export (11 collections, every mode)
    nuclios.css            ← GENERATED tokens (do not edit by hand)
  scripts/
    build-tokens.mjs       ← bento-variables.json → nuclios.css
  components/              ← NucliOS components (import from "@nuclios")
  showcase/                ← sticker sheet (open /nuclios.html in the dev server)
```

Wiring inside the design system:

- `src/theme/theme-nuclios.css` imports `tokens/nuclios.css` and registers this folder with Tailwind (`@source`).
- `src/index.css` imports `theme-nuclios.css`.
- `vite.config.ts` and `tsconfig.app.json` alias `@nuclios` → `nuclios theme/components`.

## Activate

Put the classes on **`<html>`**, not a wrapper div. Modals, menus, selects and tooltips render in a portal
under `<body>`, so they only pick up the theme from `<html>`.

| Class                                                | Effect                                               | Figma source                          |
| ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| `theme-nuclios`                                      | NucliOS brand · Light · Default radius               | all collections, first mode           |
| `dark`                                               | Dark mode                                            | Colour: Semantics / Anchors → Dark    |
| `brand-good-year` / `brand-mars`                     | Brand palette swap (same element as `theme-nuclios`) | Colour: Primitives → GOOD_YEAR / MARS |
| `radius-square`, `radius-round-1` … `radius-round-4` | Corner radius scale                                  | Border Radius: Semantics              |

Layout tokens (`--layout-*`) switch automatically between the 1920 / 1366 / 1280 / 768 / 440 breakpoint modes via media queries.

## Tokens

| Figma collection             | CSS variables                                                                                | Example                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Colour: Semantics            | `--color-<group>-<name>` (same names as the base design system)                              | `--color-background-primary`, `--color-text-onprimary` |
| Colour: Anchors / Primitives | `--nuclios-anchor-*`, `--nuclios-*`                                                          | `--nuclios-primary-600`                                |
| Spacing / Unit               | `--spacing-*`, `--unit-*`                                                                    | `--spacing-s` = 8px                                    |
| Border                       | `--border-width-*`, `--radius-primitive-*`                                                   | `--border-width-regular`                               |
| Border Radius: Semantics     | `--radius-component-set-1…4`, `--radius-container-set-1…3`, `--radius-pill`, `--radius-none` |                                                        |
| Type: Primitives / Semantics | `--font-*`, `--type-*`, and classes `.nuclios-type-<style>`                                  | `.nuclios-type-body-small-medium`                      |
| Shadows                      | `--shadow-1` … `--shadow-10` (plus the parts)                                                | `shadow-(--shadow-4)`                                  |
| Breakpoints                  | `--layout-<grid>-<prop>`                                                                     | `--layout-balanced-gap`                                |
| Data visualization           | `--color-data-visualization-category-1…10`                                                   | rank 1 = most important series                         |

In Tailwind, use tokens directly: `bg-(--color-background-primary)`, `p-(--spacing-l)`,
`rounded-(--radius-component-set-1)`, `shadow-(--shadow-3)`.

**Refreshing from Figma:** re-export the variables into `tokens/bento-variables.json` (same shape:
`[{ c, modes, v: [[name, ...valuesPerMode]] }]`, aliases as `"@Variable/Name"`), then run
`node "nuclios theme/scripts/build-tokens.mjs"`.

## Components (`import { … } from "@nuclios"`)

| Component                                                                                                                              | Bento page                                | Built on                                          |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| `Button` (size large/medium/small · variant filled/border/ghost/link/neutral/secondary · destructive · loading · iconOnly · fullWidth) | Buttons                                   | base `Button`                                     |
| `Chip` (size xs–l · state rest/selected/success/warning/error/disabled · onRemove)                                                     | Chips                                     | base `Badge`                                      |
| `Tabs`, `TabsList` (type stroke/ghost/filled · size small/medium · **tone neutral/brand**), `TabsTrigger`, `TabsContent` | Tabs | base `Tabs` |
| `Tooltip` (light/dark · supportingText · side/align)                                                                                   | Tooltips                                  | base `Tooltip`                                    |
| `Card` (title · subtitle · action · footer · selected/disabled/interactive)                                                            | Cards                                     | base `Card`                                       |
| `KpiCard` (inline/stacked/centered · delta)                                                                                            | KPIs                                      | base `Card`                                       |
| `Input`, `Textarea`, `Field` (size l/m · header top/left/none · required/optional/info · helper/error)                                 | Input Fields                              | base `Input`/`Textarea`/`Label`                   |
| `Dropdown` (size l/m · header top/left/none/**inside**/**inline** · **leadingIcon** · variant outline/**filled**/**underline** + `active`) | Dropdown | Radix Select |
| `Checkbox`, `Radio` + `RadioGroup`, `Toggle` (size s/m/l · label + description)                                                        | Checkboxes, Radio Button, Toggle          | Radix Checkbox / RadioGroup / Switch              |
| `Toast` (informative/warning/success/danger · vertical/horizontal)                                                                     | Toast                                     | —                                                 |
| `Progress` (label none/right/bottom/top)                                                                                               | Progress Bar                              | Radix Progress                                    |
| `Breadcrumb` (divider slash/caret/arrow · size s/m/l · current page in Text/primary) | Breadcrumbs | — |
| `Modal` (xs/s/m/l/xl), `Drawer` (default/medium), `Popover` (optional controlled `open`/`onOpenChange`), `Menu`, `Accordion` (ghost/filled/stroke · trigger left/right/none) | Modals, Drawer, Popover, Menu, Accordians | Radix Dialog / Popover / DropdownMenu / Accordion |
| `DataTable` (sortable columns · `sortValue` · selected row · title + actions · **`selection`** checkbox column + select-all · **`rowLeading`** slot (e.g. unread dot) · **`rowClassName`** · **`pagination`** · `emptyMessage`) | Tables | base `Table` + NucliOS `Checkbox` |
| `Pagination` (rows per page · "1–10 of N" · first/prev/next/last) | Tables (footer) | NucliOS `Dropdown` / `Button` |
| `TopNav`, `SideNav` (collapsible · nested items · selected path in Text/primary + Icons/primary + Bold · unselected icons Icons/neutral-subtle · page-only selected background · 40×40 rounded tile when collapsed) | Nav Bar | — |
| `ChartCard` (title · metric value + caption · info tooltip · comments toggle with count · overflow menu) | — (dashboard widget pattern) | NucliOS `Button` / `Tooltip` / `Menu` |
| `CommentsToggle` (used by ChartCard; states: none = ghost · has comments = Background/subtle + count · hover/open = Background/primary-muted + Icons/primary · new comment = Border/primary ring flash) | — | NucliOS `Button` / `Tooltip` |
| `Avatar` (initials · size xs–l · tone from data-viz tokens) | — (added for comments) | — |
| `CaretDoubleLeft`, `CaretDoubleRight`, `CaretDown`, `CaretRight`, `CheckCircleFill` | Icons (Outline/Regular, CheckCircle Fill) | inline SVG, `currentColor` |

## Patterns used in the comments app

- **Dashboard page header:** `Breadcrumb` → page title (`nuclios-type-heading-h3-medium`) → `TabsList tone="brand"` → filter row of `Dropdown header="inline" variant="filled"` fields + `Button size="medium"` "Apply filters".
- **Widgets:** `ChartCard` in a 16px-gap grid; chart series use `--color-background-primary-pressed` (primary) and `--color-border-negative` (comparison line), then data-viz categories 2…5 for stacked series.
- **Flat surfaces:** white `Background/neutral`, `Border/subtle` dividers and card outlines, no card shadows.
- **Settings tables (Notification Settings):** bordered section with a Background/subtle header row (title + Info tooltip), rows separated by Border/subtle, and a `Dropdown header="none" variant="underline"` per row. Set `active` when the value is "Custom" — the bottom line turns Border/information to show the drill-in is open. Nested levels (screen → sub screen → tabs) use a `RadioGroup` grid on Background/subtle; only one sub screen's tabs open at a time. Unsaved changes → `Modal` (Cancel / Proceed anyway); Save → success `Toast` top right; thread-level subscribe = Bell icon outline (off, Icons/neutral-subtle) / filled (on, Icons/primary) + toast.
- **Filter dropdowns:** `Dropdown header="inline" variant="filled"` — Background/subtle fill, no outline, label left · Border/neutral separator · value right (or `header="inside"` for label-above-value) + `Button size="medium"` "Apply filters".
- **List page (All Notifications):** back `Button` + centred `nuclios-type-heading-h5-regular` title over a `Border/subtle` rule → toolbar (Filters `Menu` on a border `Button`; right side: "N rows selected" · delete icon · "Mark as read" / "Mark all as read" link) → `DataTable` with `selection`, a `Background/negative` unread dot in `rowLeading`, unread rows in Medium weight, and `pagination`.
- **Chart gridlines:** `Border/neutral` at 50% opacity (`strokeOpacity={0.5}`) on line and bar charts.

## Notes and known gaps

- **Font:** Bento uses **Graphik / Graphik Compact**, which is commercial. The tokens name Graphik first and
  fall back to Inter. Load Graphik yourself if you have a licence.
- **Missing variables:** Bento components reference `Background/kpi` and `Surface/surface 3`, which aren't
  defined as local variables in the file. They're aliased in `build-tokens.mjs` (`extras`) to
  `surface-1` / `surface-2`.
- **Dark-mode contrast:** a few Bento dark pairings are low contrast. For example, `Text/primary` on
  `Background/primary-muted`, and the light `Background/primary-disabled` used in dark mode. The tokens stay
  faithful to Figma. Components avoid the worst pairing by using neutral text on muted-primary selected states.
- **Not built yet:** Date Picker, Insights, Filters panel, Slider, Stepper, Search, Split Buttons, Empty/Error
  states, and the Icons page. The base `Icons` set (Phosphor, the same family Bento uses) covers common icons.
