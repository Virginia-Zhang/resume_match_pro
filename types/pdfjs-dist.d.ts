declare module "pdfjs-dist" {
  export interface TextItem {
    str?: string;
  }
  export interface TextContent {
    items: TextItem[];
  }
  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
  export function getDocument(params: { data: ArrayBuffer }): {
    promise: Promise<PDFDocumentProxy>;
  };
  export const GlobalWorkerOptions: { workerPort: unknown };
}
