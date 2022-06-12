import EventEmitter from "events";
import { logCurrentDir } from "./utils.js";

const emitter = new EventEmitter();

emitter.on("logDir", () => logCurrentDir());

export { emitter };
