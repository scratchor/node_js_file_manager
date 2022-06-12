import {
  up,
  list,
  changeDirectory,
  readFileContent,
  addFile,
  renameFile,
  copyFile,
  moveFile,
  removeFile,
  chooseOsInfo,
  calcHash,
} from "./utils.js";

export default {
  ".exit": [],
  up: () => up(),
  cd: async (pathToDirectory) => await changeDirectory(pathToDirectory),
  ls: async () => await list(),
  cat: async (pathToFile) => await readFileContent(pathToFile),
  add: async (fileName) => await addFile(fileName),
  rn: async (pathToFile, newFileName) =>
    await renameFile(pathToFile, newFileName),
  cp: async (pathToFile, pathToNewDirectory) =>
    await copyFile(pathToFile, pathToNewDirectory),
  mv: async (pathToFile, pathToNewDirectory) =>
    await moveFile(pathToFile, pathToNewDirectory),
  rm: async (pathToFile) => await removeFile(pathToFile),
  hash: async (pathToFile) => await calcHash(pathToFile),
  os: async (cmdKey) => await chooseOsInfo(cmdKey),
};
