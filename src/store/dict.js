import { defineStore } from 'pinia';
import roleList from "../algo/role-list";
import {useSelectStore} from "./select";

/**
 * 字典数据
 */
export const useDictStore = defineStore({
    id: 'dict',
    state: () => {
        return {
            // AI 角色列表 
            roleList: roleList,
            boardMinLength: 4,  // 棋盘最小数
            boardMaxLength: 32,  // 棋盘最大数
            boardLengthMarks: {  // 棋盘长度备注 
                4: '简单', 
                8: '标准',
                12: '复杂',
                16: '骨灰',
                24: '下到明天',
                32: '下个三天三夜',
            },
            // 棋盘x坐标轴对应字母
            xName: [
                '', 
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'
            ],  

        }
    },
    actions: {
        // 根据角色id获取角色
        getRole(roleId) {
            return this.roleList.find(item => item.id === roleId);
        },
        // 根据角色id获取角色名称
        getRoleName(roleId, chessType) {
            const role = this.roleList.find(item => item.id === roleId);
            if(roleId === 'qixian' && chessType) {
                const selectStore = useSelectStore();
                return role.name + '-' + selectStore[`${chessType}QxDepth`];
            }
            return role.name;
        },
    }
})
