// src/types/allow-js-imports.d.ts
// Allow imports that reference compiled .js inside src to be accepted by TS server.
// Examples: import x from '../../src/app.js'
declare module "*src/*.js" {
  const whatever: any;
  export default whatever;
}
