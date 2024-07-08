import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import AutoImport from 'unplugin-auto-import/vite';
import { createHtmlPlugin } from "vite-plugin-html";

const {resolve} = require('path')

// https://vitejs.dev/config/
export default defineConfig(mode => {
    const env = loadEnv(mode.mode, process.cwd());
    return {
        // path 上下文   -- 这个值也可以在命令行来指定： vite build --base=/xxx/
        base: env.VITE_PUBLIC_PATH,
        // 
        server: {
            proxy: {}
        },
        // 插件列表
        plugins: [
            vue(),
            legacy({
                targets: ['defaults', 'not IE 11']
            }),
            // 这个插件可以简化 vue3 定义组件名称的方式
            VueSetupExtend(),
            // 相关 API 自动导入 
            AutoImport({
                imports: ['vue', 'vue-router'],
            }),
            // 在 index.html 中使用 EJS 标签
            createHtmlPlugin({
                data: {
                    title: env.VITE_ADMIN_TITLE
                }
            }),
        ],
        resolve: {
            // kn. 配置路径别名   -- 以@开头的路径，都相当于 /src/ 下的根路径
            alias: {
                '@': resolve(__dirname, '.', './src/'),
                '/@': resolve(__dirname, '.', './src/'),
            },
            // 配置可省略不写的文件后缀
            extensions: ['.vue', '.js', '.json', '.css']
        }
    }
})
