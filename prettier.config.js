module.exports = {
  trailingComma: 'all',
  arrowParens: 'always',
  singleQuote: true,
  jsxSingleQuote: true,
  printWidth: 100,
  semi: true,
  tabWidth: 2,
  useTabs: false,
  singleAttributePerLine: true,
  overrides: [
    {
      files: '*.yaml',
      options: {
        singleQuote: false,
      },
    },
  ],
};
