const pino = require("pino");

const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});

module.exports = logger;
