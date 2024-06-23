/**
 * AI：棋级陪练，行棋算法 
 */
export default {
    id: 'qisheng',
    name: '棋圣',
    // 落子
    downChess: function (activeRole, canDownArr) {

        // 菜狗固定选择最后一个落子方案，回收最多的棋子 
        return canDownArr[canDownArr.length - 1];
    }
}
