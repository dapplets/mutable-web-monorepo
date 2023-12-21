export interface IParser {
  parseContext(
    element: Element,
    contextName: string
  ): [string, string | null][];

  findChildElements(
    element: Element,
    contextName: string
  ): { element: Element; contextName: string }[];
}
