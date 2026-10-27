# Tracker: Jira

Loaded when the workspace resolves to `jira`. Jira varies per instance — issue types, hierarchy, and link-type names are all configurable — so this doc reads its specifics from the persisted `## Planning` line and never hardcodes them. Use whichever Jira access the session has (an MCP connector, a CLI, or the REST API); the operations below are described in Jira terms, not tool syntax.

Persisted line, all fields required:

```markdown
## Planning

Tracker: jira · Project: ABC · Map type: Epic · Ticket type: Task · Blocking link: Blocks
```

If any field is missing, ask for it before the first write — a wrong issue type creates an orphan the user has to delete by hand.

## Labels

Jira labels cannot contain spaces; most instances accept colons. Try `meridian:map` and the five siblings first. If the instance rejects the colon, use `meridian-map`, `meridian-decision`, `meridian-scout`, `meridian-prototype`, `meridian-task`, `meridian-slice` and append `· Label style: dash` to the persisted line so later sessions do not retry. If a label already exists with a different meaning in the project, ask before reusing it.

## Create the map

One issue of **Map type** in **Project**, labelled `meridian:map`, summary = the effort's name, description = the seven-section map with the Frontier section reading "open child issues — see query". Record its key.

## Create a ticket

One issue of **Ticket type** with a single type label, summary = the ticket's name, description = `## Question` plus the decision. Set its parent to the map (the parent field, or the epic link on older instances — whichever the hierarchy uses). Route items use `meridian:slice` plus a mode label, `mode:agent` or `mode:human` (dash style if the instance rejects colons); task tickets carry the same pair.

## Wire blocking

Second pass, once every ticket in the batch has a key. Create an issue link of type **Blocking link** from the blocker to the blocked issue (outward "blocks", inward "is blocked by"). If the project has no such link type, ask the user which to use, or fall back to a `Blocked by: <ticket name> (<key>)` line at the top of the blocked issue's description.

## Claim

Set the assignee before any work; an unassigned open ticket is unclaimed.

## Frontier query

JQL for the candidates, then drop any with an open blocker:

```text
project = ABC AND parent = <map key> AND statusCategory != Done AND assignee IS EMPTY
  AND labels IN (meridian:decision, meridian:scout, meridian:prototype, meridian:task)
```

For each candidate, inspect its inward **Blocking link** issues; keep the ticket only if none are open. With the description fallback, parse the `Blocked by:` line instead.

## Resolve and close

Post the answer as a comment, transition the issue to its Done status, then add one line to the map's Decision log: the ticket name (linked) plus a one-line gist. A deferred experiment stays open with a comment `Deferred → <route item name> (<key>)`. A ticket ruled out of scope is closed with a resolution of "Won't Do" (or the instance's equivalent) and gets one line in the map's Ruled out. An internal choice (Via I) has no ticket: it is the Decision log line alone.

## Graduate fog

Remove the graduated line from the map's Fog section, create the ticket(s) it became (create-then-wire), and update the map description. The fog line and its ticket never coexist.
