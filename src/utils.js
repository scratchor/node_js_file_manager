import * as path from "path";
import state from "./state.js";
import { readdir, stat, access, open, rename, unlink } from "fs/promises";
import { constants, createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import os from "os";
const { createHash } = await import("crypto");

export const getUserName = () =>
  process.argv.slice(2).join().match(/=+\w+/g).shift().replace("=", "");

export const logCurrentDir = () =>
  console.log(`You are currently in ${state.getDirname}`);

export const up = () => {
  const dirname = state.getDirname;
  if (state.getRoot !== dirname) {
    state.setDirname = path.resolve(
      ...dirname.split(`${path.sep}`).slice(0, -1)
    );
  }
};

export const list = async () => {
  const files = await readdir(state.getDirname);

  if (files.length) {
    for (const file of files) {
      console.log(file);
    }
  } else {
    console.log("Folder is empty");
  }
};

export const checkAccess = async (filePath) => {
  try {
    await access(filePath, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

export const preparePath = (initialPath) =>
  path.join(state.getDirname, initialPath);

export const changeDirectory = async (pathToDirectory) => {
  const resolvedPath = path.normalize(pathToDirectory);

  if (path.isAbsolute(resolvedPath)) {
    if (path.parse(resolvedPath).root === state.getRoot) {
      const pathStat = await stat(resolvedPath);

      if (pathStat.isDirectory()) {
        state.setDirname = resolvedPath;
      }
    }
  } else {
    const finalPath = preparePath(resolvedPath);
    const pathStat = await stat(finalPath);

    if (pathStat.isDirectory()) {
      state.setDirname = finalPath;
    }
  }
};

export const readFileContent = async (pathToFile) => {
  const finalPath = preparePath(path.normalize(pathToFile));
  const pathStat = await stat(finalPath);
  const isUserHaveAccess = await checkAccess(finalPath);

  if (pathStat.isFile() && isUserHaveAccess) {
    const readStream = () => {
      return new Promise((res, rej) => {
        const inputFileStream = createReadStream(finalPath);

        inputFileStream.on("error", (err) => {
          rej(err);
          console.log();
        });

        inputFileStream.on("end", () => {
          res();
          console.log();
        });

        inputFileStream.pipe(process.stdout);
      });
    };
    await readStream();
  }
};

export const addFile = async (fileName) => {
  try {
    await open(preparePath(fileName), "wx");
  } catch (e) {
    console.log("File already exist");
  }
};

export const renameFile = async (pathToFile, newFileName) => {
  try {
    const oldPath = preparePath(path.normalize(pathToFile));
    const pathStat = await stat(oldPath);
    const isUserHaveAccess = await checkAccess(oldPath);

    if (pathStat.isFile() && isUserHaveAccess) {
      const newPath = path.format({
        ...path.parse(oldPath),
        base: newFileName,
      });

      await rename(oldPath, newPath);
    }
  } catch (e) {
    console.log("can't rename");
  }
};

export const copyFile = async (pathToFile, pathToNewDirectory) => {
  const oldPath = preparePath(path.normalize(pathToFile));
  const newPath = preparePath(
    path.normalize(path.join(pathToNewDirectory, path.parse(oldPath).base))
  );
  const pathStat = await stat(oldPath);
  const isUserHaveAccess = await checkAccess(oldPath);

  if (pathStat.isFile() && isUserHaveAccess) {
    await open(newPath, "wx");

    const readStream = createReadStream(oldPath);
    const writeStream = createWriteStream(newPath);

    await pipeline(readStream, writeStream);
  }
};

export const moveFile = async (pathToFile, pathToNewDirectory) => {
  await copyFile(pathToFile, pathToNewDirectory);
  await removeFile(pathToFile);
};

export const removeFile = async (pathToFile) => {
  const finalPath = preparePath(path.normalize(pathToFile));
  await unlink(finalPath);
};

export const calcHash = async (pathToFile) => {
  const filePath = preparePath(path.normalize(pathToFile));
  const pathStat = await stat(filePath);
  const isUserHaveAccess = await checkAccess(filePath);

  if (pathStat.isFile() && isUserHaveAccess) {
    const hash = createHash("sha256");
    const inputFileStream = createReadStream(filePath);

    await pipeline(inputFileStream, hash.setEncoding("hex"), process.stdout);
  }
};

export const showCpusInfo = (cpuData) => {
  console.log(`Overall amount of CPUS: ${cpuData.length}`);
  cpuData.forEach((e) => {
    console.log(`Model: ${e.model}, clock rate: ${e.speed * 0.001}GHz`);
  });
};

export const chooseOsInfo = async (cmdKey) => {
  const infoKey = cmdKey.replace(/--/, "");

  switch (infoKey) {
    case "EOL":
      console.log(os.EOL);
      break;
    case "cpus":
      showCpusInfo(os.cpus());
      break;
    case "homedir":
      console.log(os.homedir());
      break;
    case "username":
      console.log(os.userInfo().username);
      break;
    case "architecture":
      console.log(os.arch());
      break;
    default:
      console.error("Invalid input");
  }
};
