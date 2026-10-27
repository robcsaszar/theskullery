# Rotating the signing certificate

Do not rotate the certificate during a deploy window. A rotation that lands
mid-deploy leaves half the fleet trusting the old chain.

The first step is generating the replacement key on the bastion host. The
second step is uploading the public half to the certificate authority. The
third step is waiting for the authority to countersign, which usually takes
about ten minutes.

Open Settings → Security → Certificates to confirm the new chain appears.

Verify the chain length before restarting. Verify the intermediate is present
before restarting. Verify the expiry date is at least ninety days out before
restarting.

Do not rotate the certificate during a deploy window. A rotation that lands
mid-deploy leaves half the fleet trusting the old chain.

Restart the edge nodes one at a time, waiting for each to report healthy before
moving to the next one in the list.
