module.exports = {
  extends: ['next', 'plugin:storybook/recommended'],
  root: true,
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
}
