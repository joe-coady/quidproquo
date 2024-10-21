module.exports = {
  rules: {
    // Generator functions don't require yield, they can be stubs
    'require-yield': 'off',

    // We would like to be able to use [for of] syntax with generators
    'no-restricted-syntax': 'off',
  },
};
