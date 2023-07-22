export type WebStorageSchemaFlatType = "number" | "string" | "date";
export type WebStorageSchemaArrayType = "array";

export type WebStorageSchemaType =
  | WebStorageSchemaFlatType
  | WebStorageSchemaArrayType;

export type WebStorageSchemaTypeOption = "nullable" | "optional";

export type BaseWebStorageSchemaItem = {
  option?: WebStorageSchemaTypeOption;
};

export type BaseWebStorageSchemaFlatItem = {
  type: WebStorageSchemaFlatType;
};

export type BaseWebStorageSchemaArrayItem = {
  type: WebStorageSchemaArrayType;
  item: WebStorageSchemaItem | WebStorageSchema;
};

export type WebStorageSchemaItem = (
  | BaseWebStorageSchemaFlatItem
  | BaseWebStorageSchemaArrayItem
) &
  BaseWebStorageSchemaItem;

export type WebStorageSchema = {
  [key: string]: WebStorageSchemaItem | WebStorageSchema;
};

export type AddOptionalTypes<
  T,
  O extends WebStorageSchemaItem["option"]
> = O extends "nullable" ? T | null : O extends "optional" ? T | undefined : T;

export type WebStorageSchemaArrayItemToType<
  T extends Extract<WebStorageSchemaItem, { type: "array" }>
> = T["item"] extends WebStorageSchemaItem
  ? Array<WebStorageSchemaItemToType<T["item"]>>
  : T["item"] extends WebStorageSchema
  ? Array<WebStorageSchemaToType<T["item"]>>
  : never;

export type WebStorageSchemaItemToType<T extends WebStorageSchemaItem> =
  T["type"] extends "array"
    ? AddOptionalTypes<
        WebStorageSchemaArrayItemToType<Extract<T, { type: "array" }>>,
        T["option"]
      >
    : T["type"] extends "number"
    ? AddOptionalTypes<number, T["option"]>
    : T["type"] extends "string"
    ? AddOptionalTypes<string, T["option"]>
    : T["type"] extends "date"
    ? AddOptionalTypes<Date, T["option"]>
    : never;

export type WebStorageSchemaToType<T extends WebStorageSchema> = {
  [k in keyof T]: T[k] extends WebStorageSchema
    ? WebStorageSchemaToType<T[k]>
    : T[k] extends WebStorageSchemaItem
    ? WebStorageSchemaItemToType<T[k]>
    : never;
};
