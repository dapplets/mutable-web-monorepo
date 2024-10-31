export class StoreContextDto {
  namespace: string;
  contextType: string;
  id: string | null;
  parsedContext: any;
  children?: StoreContextDto[];
  parentNode?: StoreContextDto | null;
}
