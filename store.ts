import { Low, JSONFile } from 'lowdb';

export default class Store {
  store: Low;
  currentCollection: Low;

  constructor(fileName: string) {
    const store = new Low(new JSONFile(fileName)) as Low<unknown>;
    this.store = store;
    this.currentCollection = store;
  }

  async init() {
    await this.store.read();
    this.store.data ||= {};
  }

  collection(name: string, initialCase?: unknown) {
    this.currentCollection = new Function(`this.store.data.${name}`)();
    (<Record<string, unknown>>this.currentCollection.data)[name] ||= initialCase;
  }

  get(name: string): unknown {
    return (<Record<string, unknown>>this.currentCollection.data)[name];
  }

  set(name: string, value: unknown) {
    (<Record<string, unknown>>this.currentCollection.data)[name] = value;
    this.store.write();
  }
}
