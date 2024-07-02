// 落子步骤记录，相关函数


// 创建一个落子步骤对象 
export const createStep = (index, x, y, type, nextPlayerType, role, boardData) => {
    return {
        index,  // 这是第几步 
        x, // 最后落子x轴
        y, // 最后落子y轴
        type,  // 最后落子类型：black=黑方，white=白方
        nextPlayerType,  // 下一个落子方 
        role,  // 落子方角色 ，start=系统初始落子
        boardData, // 落子之后的棋盘数据 
    }
}


