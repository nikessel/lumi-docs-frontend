export type EchoInput = { input: string };
export type EchoOutput = { result: string };

declare module "@wasm/lumi-docs-app" {
  export function echo(input: EchoInput): Promise<EchoOutput>;
  export function default(): Promise<void>;
}
