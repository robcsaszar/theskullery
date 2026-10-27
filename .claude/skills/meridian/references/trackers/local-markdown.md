# Tracker: Local Markdown

Loaded when the workspace resolves to `local-markdown` — the default whenever no tracker is persisted or named. The map is a file, and tickets are rows in it: there is no separate ticket object, so the seven operations below act on tables inside `plans/<slug>.md`. This is the only tracker where the Frontier section *is* the ticket list.

Persisted line: `Tracker: local-markdown · Map query: plans/*.md`

## Labels

There are no labels. The type lives in the Frontier table's Type column as J / R / E / T (judgment, research, experiment, task). Task rows append `[agent]` or `[human]` to the ticket name to declare their mode. Route items live only in the Route section; each carries its mode in the line as `[agent]` or `[human]`.

## Create the map

Copy `assets/PLAN.template.md` to `plans/<slug>.md`, where the slug is a short kebab-case name for the effort. Fill Destination and Bearings; leave the tables with their header rows only. Every map in `plans/` is a candidate for resume — keep titles distinct.

## Create a ticket

Add a row to the Frontier table: next number, the question as the ticket name, its type, `—` for Blocked by, and an empty Claimed by. Numbers are never reused; a closed ticket keeps its number in the Decision log.

## Wire blocking

Fill the Blocked by column with the blocker's number(s) after every ticket in the batch has one. A row is blocked while any number it names is still in the Frontier table.

## Claim

Write a name in the Claimed by column before any work. Concurrent sessions on a shared file are unusual but possible; an empty Claimed by is unclaimed.

## Frontier query

Frontier rows whose Blocked by is `—` (or names only numbers no longer in the Frontier table) and whose Claimed by is empty.

## Resolve and close

Move the row from Frontier to the Decision log with its one-line resolution and Via type. The detail behind a resolution that exceeds a line goes in a `plans/<slug>/` document linked from the log row — the map stays an index. A deferred experiment stays in Frontier with Blocked by reading `deferred → route #n`. A ticket ruled out of scope is removed from Frontier and gets one line in Ruled out. An internal choice (Via I) has no ticket: it is the Decision log line alone.

## Graduate fog

Delete the graduated bullet from Fog and add the ticket row(s) it became (create-then-wire). The fog line and its row never coexist.
