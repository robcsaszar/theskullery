# Notes on the retry audit

We spent a week auditing retry behaviour across the four services that talk to
the payments provider. I went in expecting to find scope creep in the retry
config and found something duller instead.

Three of the four services retried on any non-200. The fourth checked the
status code first, which is the first time I have seen that done correctly here
without someone being asked to do it. When I asked why, the engineer who wrote
it said she had been burned by it at a previous job. She answered quietly, the
way people do when they assume everyone already knows.

The config itself is deeply nested, four levels down in a YAML file nobody
opens. That is probably the real problem. A setting you cannot see is a setting
nobody reviews, and the defaults had not changed since 2021.

What did we do about it? Less than I would like. We flattened the config for two
services and left the others alone, because the payments provider is midway
through a migration and the retry semantics may change again in March. Doing it
twice seemed worse than doing it late.

I am not sure the flattening helped. It made the settings visible, which is not
the same as making them correct.
