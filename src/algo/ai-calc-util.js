// AI 计算相关工具函数 

const scoreMap = {
    'jiao': 10,  // 四角，10分 
    'jiaoPang': 0,  // 四角旁边，0分 
    'bian': 5, // 边，5分 
    'ciBian': -3, // 次边  
    'ciJiao': -10, // 次角，角的斜对位置
    'normal': 1, // 普通位置，1分 
}

// 计算数组中每个落子方案的得分 
export const calcCanArrScore = function (canArr, xCount, yCount) {

    canArr.forEach(item => {
        item.score = item.tranCount + calcXyScore(item, xCount, yCount);
    })
    
    return canArr;
}

// 计算指定坐标位置棋子的所属符位
export const calcXyScore = function (item, xCount, yCount) {
    const xyFuWeiName = calcXyFuWeiName(item, xCount, yCount);
    return scoreMap[xyFuWeiName];
}

// 计算指定坐标位置棋子的所属符位名称 
export const calcXyFuWeiName = function (item, xCount, yCount) {
    
    // 是否在四个角
    const jiaoArr = [ 
        {x: 1, y: 1}, 
        {x: xCount, y: 1}, 
        {x: 1, y: yCount}, 
        {x: xCount, y: yCount} 
    ];
    if( hasXy(jiaoArr, item) ){
        return 'jiao';
    }

    // 是否在四角旁边
    const jiaoPangArr = [
        {x: 1, y: 2}, {x: 2, y: 1},
        {x: xCount - 1, y: 1}, {x: xCount, y: 2},
        {x: 2, y: yCount}, {x: 1, y: yCount - 1},
        {x: xCount - 1, y: yCount}, {x: xCount, y: yCount - 1},
    ];
    if( hasXy(jiaoPangArr, item) ){
        return 'jiaoPang';
    }
    
    // 是否在次角 
    const ciJiaoArr = [
        {x: 2, y: 2},
        {x: xCount - 1, y: 2},
        {x: 2, y: yCount - 1},
        {x: xCount - 1, y: yCount - 1}
    ];
    if( hasXy(ciJiaoArr, item) ){
        return 'ciJiao';
    }

    const x = item.x;
    const y = item.y;
    
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

// arr 中是否包含 item 
const hasXy = function (arr, item2) {
    for (const item of arr) {
        if(equalsXy(item, item2)) {
            return true;
        }
    }
    return false;
}
// 两个item坐标是否相同
const equalsXy = function (item, item2) {
    return item.x === item2.x && item.y === item2.y;
}
