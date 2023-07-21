import { WebStorageSchema, WebStorageSchemaType } from ".";
import { z } from "zod";

const zodMap: Record<WebStorageSchemaType, unknown> = {
  number: z.number(),
  string: z.string(),
  date: z.coerce.date(),
};

export const schemaMaker = <T extends WebStorageSchema>(schema: T) => {
  const zodSchema = Object.entries(schema).reduce(
    (prev, [key, val]) => ({
      ...prev,
      [key]: zodMap[val],
    }),
    {}
  );

  return z.object(zodSchema);
};
