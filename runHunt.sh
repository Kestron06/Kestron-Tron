# /bin/sh

while true; do
  # Attempt to run bot. Send all errors to a discord logger
  /usr/local/bin/node hunt.js 2>&1 | ./stderrLog.js

  # Sleep to avoid spamming during a bootloop
  sleep 1
done
