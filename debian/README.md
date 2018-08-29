This is the configuration for running various whatwg.org domains on dedicated Debian servers.

# Setup

For a given server:

1. Create a fresh Debian installation, and SSH into it.
1. Get these scripts onto the server. One way is via `apt install git`, then cloning this repository.
1. As `root`, run each of the scripts in `common/`, in order. Some of these scripts require an interactive user.
1. Ensure the DNS for the appropriate domain(s) is configured to point to the server. Without this, the next step will fail.
1. As `root`, run each of the scripts in the server's directory, in order. Some of these scripts require an interactive user.
