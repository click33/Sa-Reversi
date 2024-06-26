import { defineStore } from 'pinia';
import roleList from "../algo/role-list";

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
        // 根据等级获取等级名称
        getRole(aiRoleId) {
            return this.roleList.find(item => item.id === aiRoleId);
        },
    }
})
