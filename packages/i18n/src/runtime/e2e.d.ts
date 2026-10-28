// The end-to-end test imports a real translation file. An app gets these types from the generated files;
// here a wildcard is enough, because the test only proves the compiled module runs.
declare module '*.i18n.jsonc' {
  const translations: import('./fixtures').Users;
  export default translations;
}
