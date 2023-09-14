import pino from "pino";

export default pino({}, pino.destination(`${__dirname}/app.log`));
