import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const tokenFile = resolve('src/app/design-tokens.css');
const sourceRoot = resolve('src');
const tailwindConfigFile = resolve('tailwind.config.ts');
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

function collectSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.(?:js|jsx|ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

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

const forbiddenNamedTypePattern = /\btext-(?:xs|sm)\b/g;
const arbitraryTypePattern = /\btext-\[(\d+(?:\.\d+)?)px\]/g;

for (const file of collectSourceFiles(sourceRoot)) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(forbiddenNamedTypePattern)) {
    violations.push(`${file}: forbidden undersized type utility ${match[0]}`);
  }
  for (const match of source.matchAll(arbitraryTypePattern)) {
    if (Number(match[1]) < 13) {
      violations.push(`${file}: ${match[0]} is below the 13px product minimum`);
    }
  }
}

const tailwindConfig = readFileSync(tailwindConfigFile, 'utf8');
for (const required of [
  "kicker: ['13px'",
  "body: ['16px'",
  "title: ['18px'",
  "btn: ['16px'",
  "nav: ['15px'",
  "stat: ['26px'",
  "'hero-num': ['36px'",
  "hero: ['40px'",
]) {
  if (!tailwindConfig.includes(required)) {
    violations.push(`${tailwindConfigFile}: missing semantic type token ${required}`);
  }
}

const tokens = readFileSync(tokenFile, 'utf8');
for (const required of [
  '--bg',
  '--surface',
  '--primary',
  '--primary-soft',
  '--accent',
  '--ok',
  '--warn',
  '--danger',
  '--ink',
  '--muted',
  '--type-kicker',
  '--type-body',
  '--type-navigation',
  '--type-hero-number',
]) {
  if (!tokens.includes(`${required}:`)) violations.push(`${tokenFile}: missing ${required}`);
}

if (violations.length > 0) {
  console.error(`V12 foundation guard failed:\n${violations.map((item) => `- ${item}`).join('\n')}`);
  process.exit(1);
}

console.log(`V12 foundation guard passed for ${governedFiles.length} governed files.`);
