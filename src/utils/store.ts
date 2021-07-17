import { Low, JSONFile } from 'lowdb';

interface IStore {
  files: Record<string, File>[];
}

interface File {
  fileName: string;
  filePath: string;
  accessedCount: number;
}

export default class Store {
  store: Low;

  constructor(fileName: string) {
    const store = new Low(new JSONFile(fileName)) as Low<unknown>;
    this.store = store;
  }

  async init() {
    await this.store.read();
    this.store.data ||= {};
  }

  get(name: string): unknown {
    return new Function(`this.store.data.${name}`)();
  }

  set(name: string, value: unknown) {
    new Function('value', `this.store.data.${name} = value`)(value);
  }
}
