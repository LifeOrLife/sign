module.exports = {
    env: {
        // 环境
        browser: true,
        es2021: true
    },
    extends: [
        // 拓展
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser', // 解析器，支持解析ts
    parserOptions: {
        // 解析器配置项
        ecmaVersion: 12, // 指定es版本
        sourceType: 'module' // 代码支持es6，使用module
    },
    plugins: [
        // 插件
        '@typescript-eslint'
    ],
    rules: {
        // 规则
    }
};
