"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLogger = void 0;
exports.makeShiraoriLogger = makeShiraoriLogger;
const pino_1 = __importDefault(require("pino"));
function makeShiraoriLogger(level = 'info') {
    return (0, pino_1.default)({
        level,
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:standard',
            },
        },
    });
}
exports.defaultLogger = makeShiraoriLogger('info');
//# sourceMappingURL=logger.js.map