# Hubot

Hubot is a chat bot, modeled after GitHub's Campfire bot, hubot. He's pretty
cool. He's [extendable with scripts](http://hubot.github.com/docs/#scripts) and can work on [many
different chat services](https://hubot.github.com/docs/adapters/).

This repository provides a library that's distributed by `npm` that you
use for building your own bots. See the [documentation](http://hubot.github.com/docs)
for details on getting up and running with your very own robot friend.

In most cases, you'll probably never have to hack on this repo directly if you
are building your own bot. But if you do, check out [CONTRIBUTING.md](CONTRIBUTING.md)

If you'd like to chat, drop by [#hubot](http://webchat.freenode.net/?channels=#hubot) on FreeNode IRC.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).

## Install

`npm install` installs the dependencies. This project requires:
- Node.js >= 14.x
- npm >= 6.0.0

## Architecture

This Hubot library follows a modular architecture:

- `src/` - Core robot, brain, adapter, and message classes
- `script/` - Executable scripts and CI tooling
- `index.coffee` - Module entry point that exports all core classes
- `adapters/` - Chat source adapters (shell, campfire, IRC, etc.)

The `Robot` class in `src/robot.coffee` is the central coordinator that:
- Loads adapters and scripts
- Processes incoming messages through listener middleware
- Manages the HTTP server (when enabled)
- Exposes help commands and version information

## Environment Variables

The following environment variables are commonly used with Hubot:

- `HUBOT_ADAPTER` - The adapter to use (default: "shell")
- `HUBOT_NAME` - The robot's name in chat (default: "Hubot")
- `HUBOT_ALIAS` - An alias for the robot's name
- `HUBOT_LOG_LEVEL` - The log level (default: "info")
- `EXPRESS_USER` - Username for basic auth on the Express server
- `EXPRESS_PASSWORD` - Password for basic auth on the Express server
- `EXPRESS_PORT` - Port for the Express server to bind to
- `PORT` - Alternative port environment variable
- `BIND_ADDRESS` - IP address to bind the server to (default: "0.0.0.0")
- `HEROKU_URL` - URL for the keep-alive ping endpoint

## Getting Started

1. Run `npm install` to install dependencies
2. Configure your environment variables (see table above)
3. Run `script/test` to verify the test suite passes
4. See the [Hubot documentation](http://hubot.github.com/docs) for adapter-specific guides

## Contributing

See [CONTRIBUTING.md] for guidelines on contributing to this project.

Pull requests are welcome. Please ensure:
- New features include tests
- `npm run lint` passes without errors
- The test suite runs green on a fresh clone

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).