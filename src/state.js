import os from "os";
import path from "path";

class State {
  constructor() {
    this.dirname = os.homedir();
    this.root = path.parse(this.getDirname).root;
  }

  get getDirname() {
    return this.dirname;
  }

  get getRoot() {
    return this.root;
  }

  set setDirname(newDir) {
    this.dirname = newDir;
  }
}

const state = new State();

export default state;
