// eslint 代码校正(自虐)配置
module.exports = {
    // 是否为跟配置文件
    root: true,
    // 对环境定义的一组全局变量的预设
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    // 代码中所有用到的全局变量
    globals: {
        // '$': true,
        // 'console': false
    },
    // 解释器
    parser: 'vue-eslint-parser',
    // 继承的规则
    extends: ['plugin:vue/recommended', 'plugin:vue/vue3-essential'],
    plugins: ['vue'],
    /**
	 *	自定义的规则，
	 *	规则值：
	 *		off / 0：代表关闭，
	 *		warn / 1：代表警告，
	 *		error / 2：代表错误
	 *	参考：
	 * 		eslint 规则：http://eslint.cn/docs/rules/
	 *		vue 配置 eslint ：https://eslint.vuejs.org/rules/
 	 */
    rules: {
        // 是否必须末尾分号，never=不、always=是
        // semi: [1, 'always'],
        // 规定代码缩进是几个空格
        "indent": [1, 4],
        "vue/html-indent": [1, 4],

        // 关闭组件名风格限制 
        'vue/component-options-name-casing': 'off',
        'vue/component-definition-name-casing': 'off',
        //
        "vue/require-valid-default-prop": 'off',
        //
        'vue/custom-event-name-casing': 'off',
        'vue/attributes-order': 'off',
        'vue/one-component-per-file': 'off',
        'vue/html-closing-bracket-newline': 'off',
        'vue/max-attributes-per-line': 'off',
        'vue/multiline-html-element-content-newline': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/attribute-hyphenation': 'off',
        'vue/html-self-closing': 'off',
        'vue/no-multiple-template-root': 'off',
        'vue/require-default-prop': 'off',
        'vue/no-v-model-argument': 'off',
        'vue/no-arrow-functions-in-watch': 'off',
        'vue/no-template-key': 'off',
        'vue/no-v-html': 'off',
        'vue/comment-directive': 'off',
        'vue/no-parsing-error': 'off',
        'vue/no-deprecated-v-on-native-modifier': 'off',
        'vue/multi-word-component-names': 'off',
        'no-useless-escape': 'off',
        'no-sparse-arrays': 'off',
        'no-prototype-builtins': 'off',
        'no-constant-condition': 'off',
        'no-use-before-define': 'off',
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
        'generator-star-spacing': 'off',
        'no-unreachable': 'off',
        'no-multiple-template-root': 'off',
        'no-unused-vars': 'off',
        'no-v-model-argument': 'off',
        'no-case-declarations': 'off',
        'no-console': 'off',
        'no-undef': 'off',
    },
};
