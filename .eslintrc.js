module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "extends": [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        'prettier',
        'prettier/@typescript-eslint',
        'prettier/react'
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "tsconfigRootDir": ".",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "plugins": [
        "@typescript-eslint",
        'jsdoc',
        'prettier',
        "react",
        "react-hooks",
        'file-progress'
    ],
    "rules": {
        "prettier/prettier": "error",
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "file-progress/activate": 1,
        "@typescript-eslint/array-type": [
            "error",
            {
                "default": "array-simple"
            }
        ],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-unsafe-return" : "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-regexp-exec": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { "vars": "all", "args": "none", "ignoreRestSiblings": true }],
        "@typescript-eslint/unified-signatures": "error",
        "complexity": "off",
        "constructor-super": "error",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "error",
        "id-blacklist": "off",
        "id-match": "error",
        "import/order": "off",
        "jsdoc/check-alignment": "error",
        "jsdoc/check-indentation": "error",
        "jsdoc/newline-after-description": "error",
        "max-classes-per-file": [
            "error",
            1
        ],
        "no-bitwise": "error",
        "no-caller": "error",
        "no-case-declarations": "off",
        "no-cond-assign": "error",
        "no-console": "off",
        "no-debugger": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-fallthrough": "off",
        "no-invalid-this": "off",
        "no-new-wrappers": "error",
        "no-shadow": [
            "error",
            {
                "hoist": "all"
            }
        ],
        "no-throw-literal": "error",
        "no-trailing-spaces": "warn",
        "no-undef-init": "error",
        "no-unsafe-finally": "error",
        "no-unused-labels": "error",
        "no-useless-escape": "off",
        "no-var": "error",
        "object-shorthand": "off",
        "one-var": [
            "error",
            "never"
        ],
        "use-isnan": "error",
        "valid-typeof": "off",

        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",

        "react/display-name": "off",
        "react/no-access-state-in-setstate": "error",
        "react/no-danger": "off",
        "react/no-multi-comp": "off",
        "react/no-this-in-sfc": "error",
        "react/no-unescaped-entities": "off",
        "react/prefer-stateless-function": "error",
        "react/jsx-filename-extension": ["error", { "extensions": [".tsx"] }],
        "react/jsx-no-bind": "off",
        "react/jsx-no-literals": "off",
        "react/jsx-no-useless-fragment": "error",
        "react/jsx-pascal-case": "error",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": 1,
        "react-hooks/exhaustive-deps": 1,
    },
    "settings": {
        "react": {
            "createClass": "createReactClass",
            "pragma": "React",
            "version": "detect",
            "flowVersion": "0.53"
        },
        "propWrapperFunctions": [
            "forbidExtraProps",
            {"property": "freeze", "object": "Object"},
            {"property": "myFavoriteWrapper"}
        ],
        "linkComponents": [
            "Hyperlink",
            {"name": "Link", "linkAttribute": "to"}
        ]
    },
    "ignorePatterns": [".eslintrc.js"]
};
