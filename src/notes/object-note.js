// 对一些对象的属性进行注释 

// 落子数据属性
const stepList = [
    {
        step: 0,  // 这是第几步 
        x: 4, // 最后落子x轴
        y: 4, // 最后落子y轴
        type: 'black',  // 最后落子类型：black=黑方，white=白方
        nextPlayerType: 'white',  // 下一个落子方 
        role: 'user',  // 落子方角色 ，start=系统初始落子
        boardData: [], // 落子之后的棋盘数据 
    }
]

