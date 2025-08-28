// CommonJS-friendly import of JSON without import assertions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const levisR3 = require('./configs/levis-r3.json');

export const themes = {
  'levis-r3': levisR3
};
export type ThemeName = keyof typeof themes;
