module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'jsx-a11y/anchor-is-valid': 'off'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
};
