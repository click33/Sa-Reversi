// ---------------- 基础工具函数 ----------------


// 创建一个棋子数据
import {useDictStore} from "../../store/dict";

// 创建一个标准棋子对象，用于棋盘实时渲染
export const createChess = function (x, y, type) {
    return {
        x,   // x轴坐标 
        y,  // y轴坐标 
        type,  // 棋子类型 
        tipsType: 'none',  // 提示类型
        tranCount: 0,  // 此处落子可翻转的棋子数量
        score: 0,  // 此处落子可得评分 
    }
};

// 创建一个背后棋子数据，用于背后的逻辑运算（相较于标准棋子，删减和增加一些用于背后计算的属性）
export const createBackChess = function (x, y, type) {
    return {
        x,   // x轴坐标 
        y,  // y轴坐标 
        type,  // 棋子类型 
        tranCount: 0,  // 此处落子可翻转的棋子数量 
        score: 0,  // 此处落子可得评分 
    }
};

// 判断一个 格子/棋子 是否为 已经落子 状态
export const isDownChess = chess => {
    return chess && (chess.type === 'black' || chess.type === 'white');
}

// 两个棋子坐标是否相同
export const equalsChessXy = function (chess, chess2) {
    return chess.x === chess2.x && chess.y === chess2.y;
}

// 一组棋子中是否包含指定棋子（根据坐标来判断） 
export const hasChessXy = function (arr, chess) {
    for (const item of arr) {
        if (equalsChessXy(item, chess)) {
            return true;
        }
    }
    return false;
}

// 获取坐标的字符串描写形式，形如： (A, 1)
export const getXyStr = function (x, y) {
    const dictStore = useDictStore();
    if (x && x.x) {
        return '(' + dictStore.xName[x.x] + ', ' + x.y + ')';
    }
    return '(' + dictStore.xName[x] + ', ' + y + ')';
};

// 获取坐标的字符串描写简单形式，形如： A,1
export const getXySimpleStr = function (x, y) {
    const dictStore = useDictStore();
    if (x && x.x) {
        return dictStore.xName[x.x] + ',' + x.y;
    }
    return dictStore.xName[x] + ',' + y;
};

// 棋子类型，单个字符画形式 
export const chessTypeToChar = function (chessType) {
    if (chessType === 'black') {
        return '●';
    }
    if (chessType === 'white') {
        return '○';
    }
    return '  ';
}

// 计算下一个棋子类型 
export const __nextChessType = function (type) {
    if (type === 'black') {
        return 'white';
    }
    return 'black';
}







