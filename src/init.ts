import type { WebStorageSchema, WebStorageSchemaToType } from "./schema";
import { schemaMaker } from "./schema/shema";

type Storage = "local" | "session";

const storages: Record<Storage, globalThis.Storage> = {
  local: localStorage,
  session: sessionStorage,
} as const;

export const initStorageState = <T extends WebStorageSchema>(
  type: Storage,
  key: string,
  schema: T
) => {
  const zodSchema = schemaMaker(schema);
  const storage = storages[type];

  const setStorageState = (value: WebStorageSchemaToType<T>) => {
    storage.setItem(key, JSON.stringify(value));
  };

  const getStorageState = () => {
    const item = storage.getItem(key);

    if (item === null) {
      return item;
    }
    return zodSchema.parse(JSON.parse(item)) as WebStorageSchemaToType<T>;
  };

  return { getStorageState, setStorageState };
};
