# Why we stopped paging on disk usage

Our disk alert fired 340 times last quarter. Nobody acted on a single one
of them.

The threshold was 80%, set in 2019 by someone who has since left. At the
time we ran on 200GB volumes and 80% left enough room to notice a runaway
log and fix it before anything broke. We now run on 4TB volumes. Twenty
percent of 4TB is 800GB, which is roughly six weeks of headroom at our
worst observed growth rate. Six weeks is not a page. It is a ticket, and we
already had a queue for those.

So we deleted the alert.

What replaced it took longer to get right. We wanted to know about disks
that would fill, not disks that were full, and those are different
questions. The second one a threshold answers. The first one needs a
slope. We fit a line over the trailing fourteen days and alert when the
projection crosses full inside seven days. That fires roughly twice a
month now, and both of us who carry the pager have acted on every one.

I am less sure this generalises than I was when we shipped it. Our growth
curves are unusually smooth. A service with spiky writes would need
something with more give in it, and I do not know what that looks like
yet.

The part worth stealing is smaller than the projection maths. Before you
tune an alert, count how many times it fired and how many times somebody
did something. If those two numbers are far apart, the threshold is not
wrong. The alert is answering a question nobody asked.
