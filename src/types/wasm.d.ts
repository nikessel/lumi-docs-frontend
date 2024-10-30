// src/types/wasm.d.ts
declare module "*.wasm" {
  const content: WebAssembly.Module;
  export default content;
}

declare module "@wasm/*" {
  const content: any;
  export default content;
}
