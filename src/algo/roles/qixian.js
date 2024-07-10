import {useGameStore} from "../../store/game";
import {calcStrategyTree} from "../playing-chess/depth-strategy";
import {showDepthStrategyTree, showDepthStrategyTreeCostTime} from "../playing-chess/strategy-show-funs";
import {useSelectStore} from "../../store/select";
import {__nextChessType} from "../playing-chess/chess-funs";
import webWorkerFunction from "../playing-chess/depth-web-worker.js";
import VueWorker from 'simple-web-worker';
import {getCanDownArray} from "../playing-chess/board-calc";
import {chaosArray} from "../playing-chess/common-util";

// import faa from './show-faa.js';

const showFa = () => {
    return "abvc";
}

/**
 * AI：棋仙陪练，行棋算法 
 */
export default {
    id: 'qixian',
    name: '棋仙',
    // 落子
    downChess: function ({ downChessFunction, boardData, downChessType, canDownArr }) {

        const gameStore = useGameStore();
        gameStore[`${downChessType}StrategyTreeInCall`] = true;

        // console.log('-------- 计算开始 ');
        const startTime = performance.now();
        
        // 1、获取允许落哪些子
        const strategyTree = chaosArray( calcStrategyTree(boardData, downChessType, 1) );
        const canDownMap = getCanDownMap(strategyTree);
        const depth = getQxDepth(downChessType);
        
        // 2、收获计算结果 
        // 计算成功 
        const calcSuccess = ( res ) => {
            // 
            const item = canDownMap[res.id];
            item.calcStatus = 'success';
            item.nextChessCanArray = res.strategyTree;
            repSubStrategy(item);

            // 刷新策略树 
            showDepthStrategyTree(strategyTree, downChessType, this.name + '-' + depth);

            // 计算耗时数据 
            const endTime = performance.now();
            showDepthStrategyTreeCostTime(downChessType, parseInt(endTime - startTime));

            // 检测是否都完工了 
            if(isCalcComplete(strategyTree)) {
                calcComplete();
            }
        };
        // 计算失败
        const calcFail = ( res ) => {
            console.log('收到错误', res.message)
            console.log(res)
            const item = canDownMap[res.id];
            item.calcStatus = 'fail';
            item.errorMessage = res.message;
            item.subjectMaxScore = -99999;

            // 刷新策略树 
            showDepthStrategyTree(strategyTree, downChessType, this.name + '-' + depth);

            // 计算耗时数据 
            const endTime = performance.now();
            showDepthStrategyTreeCostTime(downChessType, parseInt(endTime - startTime));

            // 检测是否都完工了 
            if(isCalcComplete(strategyTree)) {
                calcComplete();
            }
        }
        // 计算最终完成 
        const calcComplete = () => {
            // 总策略组，按照得分排序一下
            repStrategy(strategyTree);

            // 显示到策略树上 
            showDepthStrategyTree(strategyTree, downChessType, this.name + '-' + depth);

            // 计算耗时数据 
            const endTime = performance.now();
            showDepthStrategyTreeCostTime(downChessType, parseInt(endTime - startTime));

            // 选择最高得分方案，作为最终落子方案 
            gameStore[`${downChessType}StrategyTreeInCall`] = false;
            downChessFunction(strategyTree[strategyTree.length - 1], downChessType);
        }

        // 3、开始计算：如果深度=1，直接落子，如果深度>1，多线程并行计算 
        if(depth <= 1) {
            calcComplete();
        } else {
            // 先初步显示策略树一下 
            showDepthStrategyTree(strategyTree, downChessType, this.name + '-' + depth);
            showDepthStrategyTreeCostTime(downChessType, parseInt(performance.now() - startTime));

            // 多线程并行计算  
            const vueWorkerArray = [];
            strategyTree.forEach(item => {
                item.calcStatus = 'calc';  // 标记该子策略的计算状态：calc=计算中，success=计算成功，fail=计算失败 
            });
            strategyTree.forEach(canDownChess => {
                canDownChess.downAfterBoard_Step = [{x: canDownChess.x, y: canDownChess.y}];
                const args = [canDownChess, depth];

                let vueWorkerItem = VueWorker.run(webWorkerFunction, args)
                    .then(resStr => {
                        const res = JSON.parse(resStr);
                        // console.log('子线程发来消息222--：', res)
                        calcSuccess( res );
                    })
                    .catch(err => {
                        // console.error(err)
                        err.id = canDownChess.id;
                        calcFail( err );
                    });
            })
        }

    }
}

// 获取应该的计算深度
const getQxDepth = function (downChessType) {
    const selectStore = useSelectStore();
    let depth = selectStore[`${downChessType}QxDepth`];
    if(selectStore[`${downChessType}Role`] === 'user') {
        depth = selectStore.helpQxDepth;
    }
    return depth;
};

// 创建一个 Map 映射 
const getCanDownMap = canDownArray => {
    const canDownMap = {}
    canDownArray.forEach(item => {
        canDownMap[item.id] = item;
    })
    return canDownMap;
}

// 检查一个策略树是否已经完全计算完毕 
const isCalcComplete = canDownArray => {
    let isComplete = true;
    canDownArray.forEach(item => {
        // 只要有一个没有计算完毕，就返回 false 
        if(item.calcStatus === 'calc') {
            isComplete = false;
        }
    })
    return isComplete;
}

// 某一个子策略算好了，进行规整一下 
const repSubStrategy = (canDownChess) => {
    // 将子策略组按照得分排序 ，从小到大 
    const canDownArray = canDownChess.nextChessCanArray;
    const minItem = canDownArray[0];
    canDownChess.subjectMaxScore = minItem.subjectMaxScore;      // 此策略能获得的最大得分 
    canDownChess.subStrategyCount = 0;        // 此策略下的子策略个数
    canDownArray.forEach(item => {
        canDownChess.subStrategyCount += item.subStrategyCount;
    });
    // 显示到策略树上 
    
};


// 根据子策略组，再次排序一次 
const repStrategy = strategyTree => {
    // 

    // 将最外层再次排序，从大到小  
    const canDownArray = strategyTree;
    canDownArray.forEach(item => {
        item.isMin = false;
        item.isMax = false;
    });
    canDownArray.sort((a, b) => a.subjectMaxScore - b.subjectMaxScore);
    const minItem = canDownArray[0];
    const maxItem = canDownArray[canDownArray.length - 1];
    minItem.isMin = true;
    maxItem.isMax = true;
}

// 对字符串解压缩 
function decompress(strCompressedString) {
    var strNormalString = "";
    var ht = [];

    for(i = 0; i < 128; i++) {
        ht[i] = String.fromCharCode(i);
    }

    var used = 128;
    var intLeftOver = 0;
    var intOutputCode = 0;
    var ccode = 0;
    var pcode = 0;
    var key = 0;

    for(var i=0; i<strCompressedString.length; i++) {
        intLeftOver += 16;
        intOutputCode <<= 16;
        intOutputCode |= strCompressedString.charCodeAt(i);

        while(1) {
            if(intLeftOver >= 12) {
                ccode = intOutputCode >> (intLeftOver - 12);
                if( typeof( key = ht[ccode] ) != "undefined" ) {
                    strNormalString += key;
                    if(used > 128) {
                        ht[ht.length] = ht[pcode] + key.substr(0, 1);
                    }
                    pcode = ccode;
                } else {
                    key = ht[pcode] + ht[pcode].substr(0, 1);
                    strNormalString += key;
                    ht[ht.length] = ht[pcode] + key.substr(0, 1);
                    pcode = ht.length - 1;
                }

                used ++;
                intLeftOver -= 12;
                intOutputCode &= (Math.pow(2,intLeftOver) - 1);
            } else {
                break;
            }
        }
    }
    return strNormalString;
}
