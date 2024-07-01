
// 指定坐标落子后，计算需要翻转的棋子坐标列表 
import {createBackChess, isDownChess} from "./chess-funs";
import {getBoardXyCount, getChessByXy} from "./board-funs";
import {copyArray} from "./common-util";

// 在一个棋盘上，指定坐标落子后，计算需要翻转的棋子坐标列表 
export const getTranList = (boardData, downX, downY, downType) => {
    
    // 
    const { xCount, yCount } = getBoardXyCount(boardData);
    const mockDownChess = createBackChess(downX, downY, downType);

    // 上 
    let topArr = [mockDownChess];
    for (let y = downY - 1; y >= 1; y--) {
        const item = getChessByXy(boardData, downX, y);
        if(isDownChess(item))
            topArr.push(item)
        else
            break;
    }
    // 下
    let bottomArr = [mockDownChess];
    for (let y = downY + 1; y <= yCount; y++) {
        const item = getChessByXy(boardData, downX, y);
        if(isDownChess(item))
            bottomArr.push(item)
        else
            break;
    }
    // 左 
    let leftArr = [mockDownChess];
    for (let x = downX - 1; x >= 1; x--) {
        const item = getChessByXy(boardData, x, downY);
        if(isDownChess(item))
            leftArr.push(item)
        else
            break;
    }
    // 右
    let rightArr = [mockDownChess];
    for (let x = downX + 1; x <= xCount; x++) {
        const item = getChessByXy(boardData, x, downY);
        if(isDownChess(item))
            rightArr.push(item)
        else
            break;
    }
    // 左上
    let topLeftArr = [mockDownChess];
    for (let x = downX - 1, y = downY - 1; x >= 1 && y >= 1; x--, y--) {
        const item = getChessByXy(boardData, x, y);
        if(isDownChess(item))
            topLeftArr.push(item)
        else
            break;
    }
    // 右上 
    let topRightArr = [mockDownChess];
    for (let x = downX + 1, y = downY - 1; x <= xCount && y >= 1; x++, y--) {
        const item = getChessByXy(boardData, x, y);
        if(isDownChess(item))
            topRightArr.push(item)
        else
            break;
    }
    // 左下
    let bottomLeftArr = [mockDownChess];
    for (let x = downX - 1, y = downY + 1; x >= 1 && y <= yCount; x--, y++) {
        const item = getChessByXy(boardData, x, y);
        if(isDownChess(item))
            bottomLeftArr.push(item)
        else
            break;
    }
    // 右下
    let bottomRightArr = [mockDownChess];
    for (let x = downX + 1, y = downY + 1; x <= xCount && y <= yCount; x++, y++) {
        const item = getChessByXy(boardData, x, y);
        if(isDownChess(item))
            bottomRightArr.push(item)
        else
            break;
    }

    // 返回所有需要转换的落子坐标列表 
    const topTranArr = getShouldTran(topArr);
    const bottomTranArr = getShouldTran(bottomArr);
    const leftTranArr = getShouldTran(leftArr);
    const rightTranArr = getShouldTran(rightArr);
    const topLeftTranArr = getShouldTran(topLeftArr);
    const topRightTranArr = getShouldTran(topRightArr);
    const bottomLeftTranArr = getShouldTran(bottomLeftArr);
    const bottomRightTranArr = getShouldTran(bottomRightArr);

    const tranArr = [...topTranArr, ...bottomTranArr, ...leftTranArr, ...rightTranArr, ...topLeftTranArr, ...topRightTranArr, ...bottomLeftTranArr, ...bottomRightTranArr];
    return copyArray(tranArr);
}

/**
 * 返回一组落子中，应该发生转换的落子
 */
const getShouldTran = arr => {
    // 数组长度小于3时，肯定不会发生转换 
    if(arr.length < 3) {
        return [];
    }

    // 
    const firstType = arr[0].type;
    const tranArr = [];
    for (let i = 1; i < arr.length; i++) {
        const item = arr[i];
        // 状态不一样，应该发生转换
        if(item.type !== firstType) {
            tranArr.push(item);
        }
        // 状态一样了，应该停止遍历了，把已经收集到的坐标数据返回 
        if(item.type === firstType) {
            return tranArr;
        }
    }

    // 如果 for 循环走完，说明截止到数组末尾，都没有遇到 firstType 状态的棋子，此时不应该发生转换，返回空数组
    return [];
}
