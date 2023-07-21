export type WebStorageSchemaType = "number" | "string" | "date";
export type WebStorageSchema = { [key: string]: WebStorageSchemaType };

export type WebStorageSchemaTypeToType<T extends WebStorageSchemaType> =
  T extends "number"
    ? number
    : T extends "string"
    ? string
    : T extends "date"
    ? Date
    : never;

export type WebStorageSchemaToType<T extends WebStorageSchema> = {
  [k in keyof T]: WebStorageSchemaTypeToType<T[k]>;
};
