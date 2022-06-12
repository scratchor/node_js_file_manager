import readline from "readline";
import commands from "./commands.js";
import { getUserName } from "./utils.js";
import { emitter } from "./emitter.js";
import state from "./state.js";

process.on("uncaughtException", () => {
  console.error("Operation failed");
  emitter.emit("logDir");
});

try {
  console.log(`Welcome to the File Manager, ${getUserName()}!`);
  emitter.emit("logDir", state.getDirname);

  const rl = readline.createInterface({
    input: process.stdin,
  });

  rl.setPrompt("Please, enter you command\n");
  rl.prompt(true);

  rl.on("line", async (cmd) => {
    const cmsToArr = cmd.trim().split(/\s+/);
    const action = cmsToArr.shift();

    if (commands[action]) {
      await commands[action](...cmsToArr);
      emitter.emit("logDir");
    } else {
      console.error("Invalid input");
      emitter.emit("logDir");
    }
  });
} catch {
  console.error("Operation failed");
}
