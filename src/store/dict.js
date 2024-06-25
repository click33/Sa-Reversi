import { defineStore } from 'pinia';
import aiRoleList from "../algo/ai-role-list";

/**
 * 字典数据
 */
export const useDictStore = defineStore({
    id: 'dict',
    state: () => {
        return {
            // AI 角色列表 
            aiRoleList: aiRoleList,
            // 选手执子信息列表 
            roleList: [
                { value: 'black', name: '我要执黑 (先手)' },
                { value: 'white', name: '我要执白 (后手)' },
                { value: 'double', name: '我要执双（无AI）' },
                { value: 'non', name: '我不执（双AI对战）' },
            ],
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
        getAIRole(aiRoleId) {
            return this.aiRoleList.find(item => item.id === aiRoleId);
        },
    }
})
