# Themes folder

This folder holds **custom colour themes** for the design system.

## Why this folder exists

The design system has two separate parts:

1. **Components** (`src/components/ui/…`) — the actual buttons, cards, tabs, tables,
   charts. These are the "machines". We do **not** edit these to change colours.
2. **Themes** (this folder) — the "paint". A theme is a small file that only changes
   colours. Because paint and machine are separate, changing a colour can **never**
   break a component.

## What's here

| File                  | What it is                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `theme-analytics.css` | Navy + coral + tan + light-blue + teal palette, taken from the NucliOS "Supplier Risk Analytics" reference chart.                          |
| `theme-nuclios.css`   | Bridge to `../../nuclios theme/` — the full Bento UI Library V2.0 token set (generated) plus NucliOS components. See that folder's README. |

## How a theme is turned on

A theme is a CSS _class name_. You switch themes by putting the class on the outermost
element of the page (usually `<html>` or the app's root `<div>`):

```html
<!-- default NucliOS look -->
<html>
  <!-- analytics (navy) look -->
  <html class="theme-analytics">
    <!-- analytics look in dark mode -->
    <html class="theme-analytics dark"></html>
  </html>
</html>
```

Remove the class to go back to the default look. Nothing else changes.

## How to make a NEW theme (recipe)

1. **Copy** `theme-analytics.css` and rename it, e.g. `theme-sunrise.css`.
2. Inside the new file, rename the class from `.theme-analytics` to `.theme-sunrise`
   (in both the light block and the `.dark` block).
3. Change the colour values (the `#xxxxxx` hex codes) to whatever you like.
4. Open `src/index.css` and add one line under the existing import:
   ```css
   @import "./theme/theme-sunrise.css";
   ```
5. Activate it with `class="theme-sunrise"` as shown above.

## The two things a theme controls

- **`--color-background-primary` (and its `text/border/icons` cousins)** — the main
  brand colour used by buttons, active tabs, links, highlights.
- **`--color-data-visualization-category-1 … 10`** — the **ranked** chart colours.
  Category 1 is the most important series, category 10 the least. Charts that read
  these tokens colour their series in this order automatically.

> Tip: you only need to list the colours you want to change. Anything you leave out is
> inherited from the base theme (`../theme-tokens.css`), which is why these files stay short.
