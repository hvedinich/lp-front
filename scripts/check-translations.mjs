import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filesNames = ['common'];
const languages = ['en', 'pl', 'ru'];
const baseLang = languages[0];

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error read file ${filePath}:`, err.message);
    process.exit(1);
  }
}

function getFilePath(lng, fileName) {
  return `../public/locales/${lng}/${fileName}.json`;
}

function flattenKeys(obj, prefix = '') {
  return Object.keys(obj).flatMap((key) => {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return flattenKeys(value, fullKey);
    }
    return fullKey;
  });
}

let hasErrors = false;

filesNames.forEach((fileName) => {
  const baseFile = path.join(__dirname, getFilePath(baseLang, fileName));
  const baseData = loadJson(baseFile);
  const baseKeys = flattenKeys(baseData);

  languages.slice(1).forEach((lng) => {
    const filePath = getFilePath(lng, fileName);
    const file = path.join(__dirname, filePath);
    const data = loadJson(file);
    const keys = flattenKeys(data);

    const missing = baseKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !baseKeys.includes(k));

    if (missing.length || extra.length) {
      console.error(`❌ Error in ${chalk.red(filePath)}`);
      if (missing.length) {
        console.error(
          'Missing translations:',
          `[${missing.map((key) => chalk.red(`\n ${key}`)).join(', ')}\n]`,
        );
      }

      if (extra.length) {
        console.error(
          'Extra translations:',
          `[${extra.map((key) => chalk.red(`\n ${key}`)).join(', ')}\n]`,
        );
      }
      hasErrors = true;
    } else {
      console.log(
        `✅ ${chalk.yellow(lng.toUpperCase())} Translations in ${chalk.yellow(fileName)} files matches`,
      );
    }
  });
});

if (hasErrors) {
  process.exit(1);
} else {
  console.log(`\n ${chalk.green('All translations synced!')}`);
}
