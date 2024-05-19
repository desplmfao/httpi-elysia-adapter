module.exports = {
   extends: ['prettier'],
   parser: '@typescript-eslint/parser',
   parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      requireConfigFile: false,
   },
   overrides: [
      {
         parserOptions: {
            project: [
               '../../**/**/tsconfig.json',
               '../../**/**/tsconfig.*?.json',
            ],
         },
         files: ['*.ts'],
         extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/eslint-recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:@typescript-eslint/strict',
            'plugin:prettier/recommended',
         ],
         rules: {
            'prettier/prettier': [
               'error',
               {},
               {
                  usePrettierrc: true,
               },
            ],
            'turbo/no-undeclared-env-vars': 0,
            'no-unused-vars': 0,
            '@typescript-eslint/return-await': 0,
            '@typescript-eslint/no-redundant-type-constituents': 2,
            '@typescript-eslint/restrict-template-expressions': 2,
            '@typescript-eslint/restrict-plus-operands': 2,
            '@typescript-eslint/adjacent-overload-signatures': 2,
            '@typescript-eslint/await-thenable': 2,
            '@typescript-eslint/ban-types': 2, // this might look confusing but it basically just forces shit like `string` instead of `String`, or `() => void` instead of `Function`
            '@typescript-eslint/consistent-type-imports': [
               2,
               {
                  fixStyle: 'inline-type-imports',
                  prefer: 'type-imports',
               },
            ],
            '@typescript-eslint/array-type': [
               2,
               {
                  default: 'array',
               },
            ],
            '@typescript-eslint/consistent-type-exports': 2,
            '@typescript-eslint/no-unused-vars': [
               0,
               {
                  argsIgnorePattern: '^_',
                  varsIgnorePattern: '^_',
                  caughtErrorsIgnorePattern: '^_',
               },
            ],
            '@typescript-eslint/no-explicit-any': 1,
            '@typescript-eslint/no-empty-function': 1,

            '@typescript-eslint/adjacent-overload-signatures': 2,
            '@typescript-eslint/await-thenable': 2,
            '@typescript-eslint/consistent-type-assertions': 2,
            '@typescript-eslint/ban-types': [
               'error',
               {
                  types: {
                     String: {
                        message: 'Use string instead',
                        fixWith: 'string',
                     },
                     Number: {
                        message: 'Use number instead',
                        fixWith: 'number',
                     },
                     Boolean: {
                        message: 'Use boolean instead',
                        fixWith: 'boolean',
                     },
                     Function: { message: 'Use explicit type instead' },
                  },
               },
            ],
            '@typescript-eslint/explicit-member-accessibility': [
               'error',
               {
                  accessibility: 'explicit',
                  overrides: {
                     accessors: 'no-public',
                     constructors: 'no-public',
                     methods: 'no-public',
                     properties: 'no-public',
                     parameterProperties: 'explicit',
                  },
               },
            ],
            '@typescript-eslint/method-signature-style': 2,
            '@typescript-eslint/no-floating-promises': 2,
            '@typescript-eslint/no-implied-eval': 2,
            '@typescript-eslint/no-for-in-array': 2,
            '@typescript-eslint/no-inferrable-types': 2,
            '@typescript-eslint/no-invalid-void-type': 2,
            '@typescript-eslint/no-misused-new': 2,
            '@typescript-eslint/no-misused-promises': 2,
            '@typescript-eslint/no-namespace': 2,
            '@typescript-eslint/no-non-null-asserted-optional-chain': 2,
            '@typescript-eslint/no-throw-literal': 2,
            '@typescript-eslint/no-unnecessary-boolean-literal-compare': 2,
            '@typescript-eslint/prefer-for-of': 2,
            '@typescript-eslint/prefer-nullish-coalescing': 2,
            '@typescript-eslint/switch-exhaustiveness-check': 2,
            '@typescript-eslint/prefer-optional-chain': 2,
            '@typescript-eslint/prefer-readonly': 2,
            '@typescript-eslint/prefer-string-starts-ends-with': 0,
            '@typescript-eslint/no-array-constructor': 2,
            '@typescript-eslint/require-await': 2,
            '@typescript-eslint/return-await': 2,
            '@typescript-eslint/ban-ts-comment': [
               2,
               {
                  'ts-expect-error': false,
                  'ts-ignore': true,
                  'ts-nocheck': true,
                  'ts-check': false,
               },
            ],
            '@typescript-eslint/naming-convention': [
               2,
               {
                  selector: 'memberLike',
                  format: ['camelCase', 'PascalCase'],
                  modifiers: ['private'],
                  leadingUnderscore: 'forbid',
               },
            ],
            '@typescript-eslint/no-unused-vars': [
               2,
               {
                  varsIgnorePattern: '^_',
                  argsIgnorePattern: '^_',
                  ignoreRestSiblings: true,
               },
            ],
            '@typescript-eslint/member-ordering': [
               2,
               {
                  default: [
                     'public-static-field',
                     'protected-static-field',
                     'private-static-field',
                     'public-static-method',
                     'protected-static-method',
                     'private-static-method',
                     'public-instance-field',
                     'protected-instance-field',
                     'private-instance-field',
                     'public-constructor',
                     'protected-constructor',
                     'private-constructor',
                     'public-instance-method',
                     'protected-instance-method',
                     'private-instance-method',
                  ],
               },
            ],
         },
         parserOptions: {
            project: ['./tsconfig.json', './packages/tsconfig/base.json'],
         },
      },
   ],
};
