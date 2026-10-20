# Security Policy

## Supported versions

Security fixes land on the latest published major of `hubot` on the `master`
branch. Older majors receive fixes only for issues rated critical.

| Version | Supported |
| ------- | --------- |
| 2.x     | yes       |
| < 2.0   | no        |

## Reporting a vulnerability

Please report suspected vulnerabilities privately rather than opening a public
issue. Include the affected version, a description of the issue, and steps to
reproduce. Expect an acknowledgement within three business days and a fix or a
mitigation plan within thirty days.

## Threat model in one paragraph

Hubot is a library. Its inputs are chat messages from whatever service an
adapter is connected to (Campfire, IRC, shell), environment configuration, the
bot's `scripts/` directory, and `external-scripts.json`. Anything in `scripts/`
is trusted code the bot owner wrote; chat messages are **not** trusted.

## What hubot does to stay safe

* **HTTP authentication fails closed.** `EXPRESS_USER` and `EXPRESS_PASSWORD`
  must both be set or both unset. Setting only one aborts startup instead of
  serving the listener without authentication. Credential comparison uses
  `crypto.timingSafeEqual`, so response time does not leak the password.
* **Security response headers** (`X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer`) are set on every response.
* **Unauthenticated listeners are noisy.** Serving on a non-loopback bind
  address without credentials logs a warning on every start.
* **Uploads are bounded.** The multipart limit defaults to 100MB and is
  configurable with `HUBOT_HTTP_MAX_UPLOAD_SIZE`; an unparseable value falls
  back to the default rather than removing the limit.
* **No prototype pollution from untrusted keys.** Brain keys and user options
  arriving from chat services are checked against `__proto__`, `constructor`,
  and `prototype`, and lookups use own-property checks so
  `brain.userForId('constructor')` returns a `User` rather than `Object`.
* **`external-scripts.json` names are validated.** Only npm package names are
  passed to `require()`, so a tampered config cannot become
  `require('/etc/passwd')`.
* **`.hubot_history` is written mode 0600** and opened with `O_NOFOLLOW`, so it
  is not world readable and cannot be used to append to another file.
* **Dependency advisories are enforced in CI** (`npm audit --omit=dev
  --audit-level=high`) and Dependabot tracks upstream releases weekly.

## What hubot cannot protect you from

* **Scripts are code.** Anything in `scripts/` or installed from npm runs with
  the bot's full privileges. Only install scripts you trust.
* **Adapters are separate packages** with their own security posture.
* **Secrets in the environment** are visible to anything that can read the
  process environment. Do not log them, and prefer a secret manager over a
  committed `.env` file.
* **`HUBOT_LOG_LEVEL=debug` logs message bodies and adapter tokens.** Keep it off
  in production.