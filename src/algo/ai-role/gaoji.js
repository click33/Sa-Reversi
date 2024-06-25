/**
 * AI：高级陪练，行棋算法 
 */
export default {
    id: 'gaoji',
    name: '高级陪练',
    // 落子函数
    downChess: function (downChessFunction, activeRole, canDownArr) {
        // 打乱顺序（如果不打乱一下，AI落子会有向上落子的倾向）
        canDownArr.sort(() => Math.random() - 0.5);
        // 按照 tranCount 从小到大升序排列  
        canDownArr.sort((a, b) => a.tranCount - b.tranCount);

        console.log('------------- 策略集合 --------------')
        canDownArr.forEach(item => {
            console.log(item.tranCount, JSON.stringify(item));
        });
        
        // 高级陪练 固定选择最后一个落子方案，回收最多的棋子 
        downChessFunction(canDownArr[canDownArr.length - 1]);
    }
}
