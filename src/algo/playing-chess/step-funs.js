// 落子步骤记录，相关函数


// 创建一个落子步骤对象 
export const createStep = (index, nextPlayerType, role, boardData) => {
    return {
        index,  // 这是第几步 
        // x, // x轴
        // y, // y轴
        // type,  // 棋子类型：black=黑方，white=白方
        nextPlayerType,  // 下一个落子方 
        role,  // 落子方角色 ，start=系统初始落子
        boardData, // 落子之后的棋盘数据 
    }
}


