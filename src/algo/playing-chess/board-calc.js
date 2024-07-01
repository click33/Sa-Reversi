// 棋盘运算相关函数 
import {createBackChess, hasChessXy} from "./chess-funs";
import {getTranList} from "./tran-funs";
import {__copyBoardData, forEachBoardData, getBoardXyCount, setChessByXy} from "./board-funs";
import {copyObject} from "./common-util";

const scoreMap = {
    'jiao': 30,  // 四角，30分 
    'jiaoPang': 10,  // 四角旁边，10分 
    'bian': 15, // 边，15分 
    'ciBian': -5, // 次边  
    'ciJiao': -15, // 次角，角的斜对位置
    'normal': 1, // 普通位置，1分 
}

// 获取一个棋盘中，指定棋子类型，所有可落子位置 
export const getCanDownArray = function (boardData, chessType) {
    const canDownArr = [];

    // 遍历所有棋子，计算每个格子是否可以落子
    forEachBoardData(boardData, chess => {
        if (chess.type !== 'none') {
            return;
        }
        // 假设在此处落子，有超过1个棋子是可以转换的，则代表此处可以落子
        const mockTranArr = getTranList(boardData, chess.x, chess.y, chessType);
        if (mockTranArr.length > 0) {
            const mockDownChess = copyObject(chess);
            mockDownChess.tranCount = mockTranArr.length;
            canDownArr.push(mockDownChess);
        }
    })

    // 
    return canDownArr;
};

// 计算一个棋盘指定类型棋子的总得分 
export const calcStaticScore = function (boardData, chessType) {
    const { xCount, yCount } = getBoardXyCount(boardData);
    let score = 0;
    forEachBoardData(boardData, chess => {
        if(chess.type === chessType) {
            score += calcXyScore(chess, xCount, yCount);
        }
    })
    return score;
}

// 模拟落子，返回落子后翻转应有旗子后的棋盘数据（会copy一份棋盘数据，不会变动原棋盘数据）
export const __mockDownChess = function(boardData, x, y, downType){
    const copyBoardData = __copyBoardData(boardData);
    
    // 计算落子后棋子翻转所有位置
    const chess = createBackChess(x, y, downType);
    const tranArr = getTranList(copyBoardData, chess.x, chess.y, downType);
    
    // 模拟落子，将棋子移动到指定位置
    setChessByXy(copyBoardData, x, y, chess);
    tranArr.forEach(item => {
        item.type = downType;
        setChessByXy(copyBoardData, item.x, item.y, item);
    });

    // 
    return {
        boardData: copyBoardData,
        tranArr: tranArr
    };
};

// 计算指定坐标位置得分 
export const calcXyScore = function (chess, xCount, yCount) {
    const xyFuWeiName = calcXyFuWeiName(chess, xCount, yCount);
    return scoreMap[xyFuWeiName];
}

// 计算指定坐标位置棋子的所属符位名称 
export const calcXyFuWeiName = function (chess, xCount, yCount) {
    
    // 是否在四个角
    const jiaoArr = [ 
        {x: 1, y: 1}, 
        {x: xCount, y: 1}, 
        {x: 1, y: yCount}, 
        {x: xCount, y: yCount} 
    ];
    if( hasChessXy(jiaoArr, chess) ){
        return 'jiao';
    }

    // 是否在四角旁边
    const jiaoPangArr = [
        {x: 1, y: 2}, {x: 2, y: 1},
        {x: xCount - 1, y: 1}, {x: xCount, y: 2},
        {x: 2, y: yCount}, {x: 1, y: yCount - 1},
        {x: xCount - 1, y: yCount}, {x: xCount, y: yCount - 1},
    ];
    if( hasChessXy(jiaoPangArr, chess) ){
        return 'jiaoPang';
    }
    
    // 是否在次角 
    const ciJiaoArr = [
        {x: 2, y: 2},
        {x: xCount - 1, y: 2},
        {x: 2, y: yCount - 1},
        {x: xCount - 1, y: yCount - 1}
    ];
    if( hasChessXy(ciJiaoArr, chess) ){
        return 'ciJiao';
    }

    const x = chess.x;
    const y = chess.y;
    
    // 是否在边 
    if( x === 1 || x === xCount || y === 1 || y === yCount ) {
        return 'bian';
    }
    // 是否在次边 
    if( x === 2 || x === xCount - 1 || y === 2 || y === yCount - 1 ) {
        return 'ciBian';
    }
    
    // 都不是，那就只能是普通位置了 
    return 'normal';
}

