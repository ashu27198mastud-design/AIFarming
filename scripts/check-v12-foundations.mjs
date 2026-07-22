import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokenFile = resolve('src/app/design-tokens.css');
const governedFiles = [
  'src/app/base-fonts.ts',
  'src/app/fonts.ts',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/opengraph-image.tsx',
  'src/app/api/preferences/language/route.ts',
  'src/app/privacy/page.tsx',
  'src/app/privacy/PrivacyPage.module.css',
  'src/app/v12-foundations.css',
  'src/components/MorningLightLogin.module.css',
  'src/components/MorningLightLogin.tsx',
  'src/lib/i18n/en.ts',
  'src/lib/i18n/hi.ts',
  'src/lib/i18n/login-types.ts',
  'src/lib/i18n/login.ts',
  'src/lib/i18n/mr.ts',
  'src/lib/morning-light.test.ts',
  'src/lib/morning-light.ts',
  'src/lib/language-preference.ts',
  'src/lib/i18n/privacy-types.ts',
  'src/lib/i18n/privacy.ts',
].map((file) => resolve(file));

const violations = [];
const hexPattern = /#[\da-f]{3,8}\b/gi;
const forbiddenFontPattern = /\b(?:Inter|DM Sans|DM Mono)\b/gi;
const forbiddenTokenPattern = /\b(?:obsidian|atmblue)\b/gi;

for (const file of governedFiles) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(hexPattern)) {
    violations.push(`${file}: raw color ${match[0]} belongs in ${tokenFile}`);
  }
  for (const match of source.matchAll(forbiddenFontPattern)) {
    violations.push(`${file}: legacy font ${match[0]} is forbidden`);
  }
  for (const match of source.matchAll(forbiddenTokenPattern)) {
    violations.push(`${file}: legacy palette token ${match[0]} is forbidden`);
  }
}

const tokens = readFileSync(tokenFile, 'utf8');
for (const required of ['--bg', '--surface', '--primary', '--accent', '--ok', '--warn', '--danger', '--ink', '--muted']) {
  if (!tokens.includes(`${required}:`)) violations.push(`${tokenFile}: missing ${required}`);
}

if (violations.length > 0) {
  console.error(`V12 foundation guard failed:\n${violations.map((item) => `- ${item}`).join('\n')}`);
  process.exit(1);
}

console.log(`V12 foundation guard passed for ${governedFiles.length} governed files.`);
