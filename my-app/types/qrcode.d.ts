declare module "qrcode" {
  export function toDataURL(
    text: string | Array<{ data: Buffer; mode?: string }>,
    options?: {
      errorCorrectionLevel?: "L" | "M" | "Q" | "H";
      margin?: number;
      width?: number;
      color?: { dark?: string; light?: string };
    }
  ): Promise<string>;

  export function toCanvas(
    canvasElement: HTMLCanvasElement,
    text: string,
    options?: Record<string, unknown>
  ): Promise<void>;
}
