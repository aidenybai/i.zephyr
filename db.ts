import { Low, JSONFile } from 'lowdb';

class Store {
  store: Low;

  constructor(fileName: string) {
    this.store = new Low(new JSONFile(fileName));
    this.store.data ||= {};
  }

  collection(name: string, value: un) {}

  get() {}

  set() {}
}
