declare module "pdf-parse" {
  type PdfResult = {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  };

  function pdf(buffer: Buffer | Uint8Array, options?: Record<string, unknown>): Promise<PdfResult>;

  export default pdf;
}
