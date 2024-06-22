import * as ElIcons from '@element-plus/icons-vue'
import SvgIcon from "../components/svg-icon/index.vue";


/*
 * 安装所有 icon
 *  样例1： <el-icon><el-icon-Apple /></el-icon>
 *  样例2： <svg-icon name="el-icon-Top" />
 *  样例3： <el-button type="primary" icon="el-icon-Edit" />
 */
export const initElIcons = function (app) {
    for (const name in ElIcons){
        app.component(`el-icon-${name}`, ElIcons[name]);
    }
    app.component('svg-icon', SvgIcon);
}
