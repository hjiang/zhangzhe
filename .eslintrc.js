module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "jest/globals": true
    },
    "plugins": ["node", "jest"],
    "extends": ["eslint:recommended", "plugin:node/recommended"],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "node/exports-style": ["error", "module.exports"],
        "no-console": 0
    }
};
