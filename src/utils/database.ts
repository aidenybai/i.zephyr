import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { File } from './file';

export class Database {
  store: JsonDB;

  constructor(fileName: string) {
    this.store = new JsonDB(new Config(fileName, true, false, '/'));
  }

  get(name: string): File {
    return this.store.getData(`/${name}`);
  }

  has(name: string): boolean {
    try {
      this.store.getData(`/${name}`);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  set(name: string, value: unknown): void {
    this.store.push(`/${name}`, value);
  }

  delete(name: string): void {
    this.store.delete(`/${name}`);
  }
}
