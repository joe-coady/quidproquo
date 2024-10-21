module.exports = {
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          [
            '^\\u0000[^.]',
            // Packages. `react`\`react-dom` packages come first.
            '^react(-dom)?$',
            '^prop-types',
            // Internal packages come last.
            '^\\w',
            '^@',
          ],
          [
            // aliases first
            '^[~]',
            '^fixtures',
            // Parent imports. Put `..` last.
            '^\\.\\.(?!/?$)',
            '^\\.\\./?$',
            // Other relative imports. Put same-folder imports and `.` last.
            '^\\./(?=.*/)(?!/?$)',
            '^\\.(?!/?$)',
            '^\\./?$',
            // With Side effect imports
            '^\\u0000\\.',
          ],
        ],
      },
    ],

    // Preference
    'import/prefer-default-export': 'off',
  },
};
