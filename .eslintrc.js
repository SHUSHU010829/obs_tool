module.exports = {
  root: true,

  plugins: ["prettier", "@typescript-eslint", "unused-imports"],
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",

  rules: {
    "no-var": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "off",
    "react/react-in-jsx-scope": "off",
    "react/display-name": 1,
    "react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
    "prettier/prettier": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "off",
    "@typescript-eslint/no-var-requires": "off",
  },
  ignorePatterns: ["**/*.css"],
};
