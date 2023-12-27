import { Context } from "./types";

export function extractParsedContext(context: Context) {
  const values: Record<string, string> = {};

  const { attributes } = context;

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes.item(i);

    if (attr) {
      if (attr.name && attr.value) {
        values[attr.name] = attr.value;
      }
    }
  }

  return {
    type: context.tagName,
    values,
  };
}
