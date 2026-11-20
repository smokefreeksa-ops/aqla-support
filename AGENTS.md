# Project conventions

- Keep shared phone constants and contact URL helpers in `src/lib/contact-numbers.ts`; migrate existing consumers only when explicitly requested, to prevent unintended contact changes.- The CSP must keep 'wasm-unsafe-eval' in script-src and data: in connect-src: the in-browser PDF engine loads its layout WebAssembly from a data: URL.
