# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

theSkullery (theskullery.net) — a static recipe site built with Jekyll 4 and deployed by Netlify. No test suite, linter, or JS build step; JS in `js/` is hand-written jQuery served as-is, and `css/main.scss` is compiled by Jekyll alongside `css/bass.css` (Basscss utility classes like `sm-col-6`, `mx-auto`, `px2`).

## Commands

```sh
bundle install
bundle exec jekyll serve   # local dev server (host 0.0.0.0 is set in _config.yml)
bundle exec jekyll build   # output to _site/
```

Netlify builds with `bundle exec jekyll build` (set in `netlify.toml`, which overrides the dashboard), using the Ruby pinned in `.ruby-version` and Bundler from `Gemfile.lock`. Netlify builds a deploy preview for each PR but doesn't report its status to GitHub; check with `netlify api listSiteDeploys` or the dashboard.

`_site/` is gitignored but an old copy is still tracked in git — never edit it; it's build output.

## Agent gate

The commands the skills and agents in `.claude/` run to check a change (convoy, transit, crucible; builder, reviewer, refuter, drill). Update these rows when the stack changes; a row marked *none* is skipped.

| Row | Command |
|---|---|
| setup | `bundle install` |
| build | `bundle exec jekyll build` |
| typecheck | none |
| lint | none |
| formatter | none |
| test (full suite) | none |
| test (single file) | none |
| e2e | none |
| clean | `bundle exec jekyll clean` |

With no test rows, the build is the check: it must finish without errors or new warnings.

Shared files — orchestrator-owned during a convoy wave: `CLAUDE.md`, `_config.yml`, `_layouts/recipe.html`, `_includes/head.html`, `css/main.scss`.

## Content model

Recipes are the core content: the `recipes` collection in `_recipes/`, one folder per recipe containing `<slug>.md` and its photo. The front matter `permalink` must be `recipes/<slug>` matching the folder name, because the layout builds the image URL as `{{page.url}}/{{page.image}}` and relies on the collection copying the image to the same path. `_recipes/banana-bread/banana-bread.md` is a good annotated reference.

Key front matter fields:
- `categories`, `tags` — space-separated strings; `meal`, `chef`, `time` — single values. Allowed values are listed in the inline comments of existing recipes.
- `servings` — base value for client-side scaling.
- `ingredients` — list items in `quantity| unit and name` form (e.g. `0.25| cup(s) milk`). `recipe.html` splits on `|`: 1 part = no quantity (not scaled), 2 parts = quantity + text, 3 parts = quantity + unit + text. The quantity lands in `data-quantity`, and `js/dynamicingredients.js` multiplies it by `servings / data-base-servings` when the servings input changes. Inline `*emphasis*` is used for notes and is stripped by the "Copy ingredients" feature (`js/shoppinglist.js`).
- Grouped sections: a list item that is a YAML key (`- for the icing:` followed by its own items) renders as a sub-heading with a nested list. This works for both `ingredients` and `directions`.
- The markdown body below the front matter is the short description shown under the title.

## Taxonomy pages

Taxonomy listings aren't generated; each value has a hand-made page:
- `category/<name>.md` → `categorypage` layout
- `tag/<name>.md` → `tagpage`
- `meal/<name>.md` → `mealpage`
- `chef/<name>.md` → `chefpage` (with an explicit `permalink: chef/<name>`)

Each layout loops over `site.recipes` and filters by the page's `category`/`tag`/`meal`/`chef` field. Adding a new taxonomy value means adding the page here. Separately, the top-level `categories.html`, `tags.html`, `meals.html` and `chefs.html` each list all recipes grouped by value on one page, with in-page anchors.

## Other moving parts

- `index.html` is paginated via `jekyll-paginate-v2` (config in `_config.yml`: `recipes` collection, 20 per page, newest first by `date`).
- Search: `search.json` is a Liquid-generated index of all recipes consumed by Simple-Jekyll-Search (`plugins/simple-jekyll-search.min.js`) together with `js/searchevents.js`. `js/random.json` is really a Liquid-templated JS file (it defines `runme()`, which jumps to a random recipe) and is loaded as a `<script>` in `_includes/head.html`. `recipes.json` and `js/index.json` look unused.
- Favorites (`js/favoriting.js`, `favorites.html`) are stored in the browser's `localStorage`.
- `sw.js` is a kill-switch service worker that unregisters itself and clears caches; `offline.html` and `manifest.json` are PWA leftovers.
- Analytics scripts live in `_includes/head.html`.
