# Rotate the signing key

Rotate the signing key every ninety days so that a leaked key has a short
useful life. The previous key stays valid for twenty-four hours so that
in-flight tokens still verify.

## Before you start

You need the keyadmin role on the cluster you are about to change. Run the
whoami command to confirm the role and the expiry time.

You need a maintenance window of at least thirty minutes on the shared
calendar. Rotation takes about four minutes and the remaining time covers
a rollback.

## Rotate the key

1. Set the cluster context to the environment you intend to change. The
   command prints the active context name so that you can confirm it.

2. Generate the new signing key with the elliptic curve algorithm. The
   command prints the new key identifier which you record before you go on.

3. Stage the new key so that the service accepts both signatures. The
   service now verifies tokens signed with either the old or the new key.

4. Promote the new key so that the service signs every token with it. The
   service now issues each new token with the key that you generated.

5. Verify the rotation by listing the active keys on the cluster. The
   command prints one active key and the identifier matches the new key.

## If verification fails

Demote the new key to return the service to the previous signature. The
service signs with the previous key and you can retry the rotation later.

Report the failure in the platform channel with the key identifier
attached. Include the output of the key listing command so that others can
help you.
