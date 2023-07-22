import {
  WebStorageSchema,
  WebStorageSchemaItem,
  WebStorageSchemaTypeOption,
} from ".";
import { z } from "zod";

const zodFlatTypesMap = {
  number: z.number(),
  string: z.string(),
  date: z.coerce.date(),
} satisfies {
  number: z.ZodNumber;
  string: z.ZodString;
  date: z.ZodDate;
};

type ZodBaseTypes =
  | z.ZodNumber
  | z.ZodString
  | z.ZodDate
  | z.ZodArray<any>
  | z.ZodObject<{}>;

type AddZodOptions<T extends z.ZodTypeAny> =
  | T
  | z.ZodNullable<T>
  | z.ZodOptional<T>;

type ZodTypes =
  | AddZodOptions<z.ZodNumber>
  | AddZodOptions<z.ZodString>
  | AddZodOptions<z.ZodDate>
  | AddZodOptions<z.ZodArray<any>>
  | AddZodOptions<z.ZodObject<{}>>;

export const addValidationOption = <T extends ZodBaseTypes>(
  zodDef: T,
  option: WebStorageSchemaTypeOption | undefined
) => {
  if (option === "nullable") {
    return zodDef.nullable();
  }
  if (option === "optional") {
    return zodDef.optional();
  }
  return zodDef;
};

export const determineValidator = ([key, val]: [
  string,
  WebStorageSchema | WebStorageSchemaItem
]) => {
  if (val.type === "number" || val.type === "string" || val.type === "date") {
    return {
      [key]: addValidationOption(zodFlatTypesMap[val.type], val.option),
    };
  }
  if (
    val.type === "array" &&
    (val.item.type === "number" ||
      val.item.type === "string" ||
      val.item.type === "date")
  ) {
    return {
      [key]: addValidationOption(
        z.array(
          addValidationOption(zodFlatTypesMap[val.item.type], val.item.option)
        ),
        val.option
      ),
    };
  }

  if (val.type === "array") {
    const subSchemaEntries = Object.entries(val.item as WebStorageSchema);
    const mappedDefinition = subSchemaEntries.map(
      determineValidator
    ) as MappedZodDefinition[];
    return {
      [key]: addValidationOption(
        z.array(z.object(joinMappedDef(mappedDefinition))),
        val.option
      ),
    };
  }

  const subSchemaEntries = Object.entries(val as WebStorageSchema);
  const mappedDefinition = subSchemaEntries.map(
    determineValidator
  ) as MappedZodDefinition[];

  return {
    [key]: z.object(joinMappedDef(mappedDefinition)),
  };
};

type MappedZodDefinition = { [key: string]: ZodTypes };

export const joinMappedDef = (array: MappedZodDefinition[]) =>
  array.reduce<MappedZodDefinition>((prev, curr) => ({ ...prev, ...curr }), {});

export const schemaMaker = <T extends WebStorageSchema>(schema: T) => {
  return z.object(
    joinMappedDef(Object.entries(schema).map(determineValidator))
  );
};
