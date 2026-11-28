# Project conventions

- Keep shared phone constants and contact URL helpers in `src/lib/contact-numbers.ts`; migrate existing consumers only when explicitly requested, to prevent unintended contact changes.- The CSP must keep 'wasm-unsafe-eval' in script-src and data: in connect-src: the in-browser PDF engine loads its layout WebAssembly from a data: URL.
- Contact validation and CSV escaping live in `src/lib/contact`; share validation between the question runner and server to prevent divergent acceptance rules.
- Read clinical contacts through the security-invoker admin view with authenticated role validation; public plan responses project no contact fields, and anonymous answer writes require the secret plan token.
