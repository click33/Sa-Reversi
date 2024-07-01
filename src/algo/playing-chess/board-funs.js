// 计算一个棋盘中，指定棋子类型，所有可落子位置，返回的是棋子副本对象列表，非棋盘原数据
import {chessTypeToChar, getXySimpleStr} from "./chess-funs";
import {copyObject} from "./common-util";

// 计算棋盘宽高数据 
export const getBoardXyCount = function (boardData) {
    // 首行和首列都是填充格，所以宽高等于数组长度减一 
    const xCount = boardData.length - 1;
    const yCount = boardData[1].length - 1;
    return {xCount, yCount};
}

// 获取一个棋盘指定坐标的棋子
export const getChessByXy = function (boardData, x, y) {
    return boardData[y][x];
};

// 设置指定坐标的棋子
export const setChessByXy = function (boardData, x, y, chess) {
    return boardData[y][x] = chess;
};

// 遍历棋盘所有格子 (只遍历棋子数据，不包括填充格)
export const forEachBoardData = function (boardData, callback) {
    boardData.forEach(tr => {
        if (tr.type === 'fill') {
            return;
        }
        tr.forEach(td => {
            if (td.type === 'fill') {
                return;
            }
            callback(td);
        })
    });
};

// 获取棋盘中每种棋子的数量
export const getChessCountInfo = function (boardData) {
    let blackCount = 0;  // 黑棋数量
    let whiteCount = 0;  // 白棋数量
    let noneCount = 0;  // 空格数量 
    forEachBoardData(boardData, item => {
        if(item.type === 'black'){
            blackCount++;
        }
        else if(item.type === 'white'){
            whiteCount++;
        }
        else{
            noneCount++;
        }
    });
    return {
        blackCount,
        whiteCount,
        noneCount
    }
};

// 拷贝棋盘 
export const __copyBoardData = function (boardData) {
    const copyBoardData = [];
    boardData.forEach(tr => {
        if (tr.type === 'fill') {
            const copyTr = copyObject(tr);
            copyBoardData.push(copyTr);
            return;
        }
        const copyTr = [];
        tr.forEach(td => {
            const copyTd = copyObject(td);
            copyTr.push(copyTd);
        })
        copyBoardData.push(copyTr);
    });
    return copyBoardData;
};

// 获取一个棋盘的字符串描写形式 
export const getBoardToString = function (boardData) {
    let fullStr = '';
    boardData.forEach(tr => {
        if (tr.type === 'fill') {
            return;
        }
        let trStr = '';
        tr.forEach(td => {
            if (td.type === 'fill') {
                return;
            }
            trStr += getXySimpleStr(td) + '' + chessTypeToChar(td.type) + '\t';
        })
        fullStr += trStr + '\n';
    });
    return fullStr;
};




