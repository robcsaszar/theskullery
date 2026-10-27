# What the queue metrics told us

Imagine a world where every alert that fires is an alert somebody wants. Think
of it as a mailbox that throws away its own junk before you open it.

Here's the kicker. Our queue depth alert fired every night at the same hour and
nobody had looked at it since the spring.

Not a threshold problem. Not a tooling problem. A problem with who owned the
rota.

The result? Nobody escalated for four months.

Everyone blames the migration, but that's not it.
The real story is that the rota was never handed over.
The truth is simple, and the metrics are clear on this point.

The nightly batch is quietly reshaping when the on-call engineer sleeps. Alert
volume → sleep debt → slower incident response, which is the loop we should
have drawn on the whiteboard a year ago.

Here's where it gets interesting: fixing the ownership will fundamentally
reshape how the team handles escalation, and it will define the next era of our
on-call practice.
