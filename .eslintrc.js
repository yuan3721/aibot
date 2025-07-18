module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential'],
  plugins: [
    "vue"
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser", // 让 TypeScript 代码使用正确的解析器
    ecmaVersion: 2020,
    sourceType: "module"
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'global-require': 0,
    "vue/multi-word-component-names": 1,
    'vue/no-undef-components': ['error', {
      ignorePatterns: ['Van|van-\\w+']
    }],
    'vue/no-multiple-template-root': 0
  },
};
