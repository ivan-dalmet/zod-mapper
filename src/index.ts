import { z } from 'zod';

export type SafeReturn<Data, Error> =
  | { success: true; data: Data }
  | { success: false; error: Error };

export const safeTransform = <Callback extends (data: Data) => any, Data>(
  callback: Callback,
  data: Data
): SafeReturn<ReturnType<Callback>, unknown> => {
  try {
    return { success: true, data: callback(data) };
  } catch (error) {
    return { success: false, error };
  }
};

export const createMapper =
  <Input, Output = Input>() =>
  <TransformedInput>({
    transformIn,
    transformOut,
  }: {
    transformIn: (data: Input) => TransformedInput;
    transformOut: (data: TransformedInput) => Output;
  }) => {
    const mapperIn = (data: Input) => {
      return transformIn(data);
    };
    const mapperOut = (data: TransformedInput) => {
      return transformOut(data);
    };
    return {
      in: mapperIn,
      out: mapperOut,
      safeIn: (data: Input) => safeTransform(mapperIn, data),
      safeOut: (data: TransformedInput) => safeTransform(mapperOut, data),
    } as const;
  };

export const createZodMapper = <
  TransformedInput,
  Schema extends z.Schema,
  SchemaOut extends z.Schema = Schema
>({
  schema,
  schemaOut,
  transformIn,
  transformOut,
}: {
  schema: Schema;
  schemaOut?: SchemaOut;
  transformIn: (data: z.infer<Schema>) => TransformedInput;
  transformOut: (data: TransformedInput) => z.infer<SchemaOut>;
}) => {
  return createMapper<z.infer<Schema>, z.infer<SchemaOut>>()({
    transformIn: (data) => {
      const parsedInput = schema.parse(data);
      return transformIn(parsedInput);
    },
    transformOut: (data) => {
      const transformedOutput = transformOut(data);
      return (schemaOut ?? schema).parse(transformedOutput);
    },
  });
};
