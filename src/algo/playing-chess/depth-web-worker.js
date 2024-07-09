
// export default function (boardData, calcChessType, currentDepth, iterationDepth, baseStep) {
export default function (canDownChess, iterationDepth) {
    
    // ------------------------------ depth-strategy 相关函数 ------------------------------

    // 【已修改】增加 __clearDownAfterBoard 步骤 
    /**
     * 计算策略树种每种策略的最终得分
     * @param boardData 棋盘数据
     * @param calcChessType 要计算的落子类型
     * @param iterationDepth 迭代深度（一般主UI线程填个3就顶天了，超过了容易直接卡死）
     */
    const calcStrategyTree = function (boardData, calcChessType, iterationDepth) {

        // 1、获取允许落哪些子
        let canDownArray = getCanDownArray(boardData, calcChessType);
        chaosArray(canDownArray);

        // 2、为每个落子策略，开始深度迭代 
        canDownArray = __mockDownChessAndCalcScore(canDownArray, boardData, calcChessType, currentDepth, iterationDepth);

        // 3、为迭代好的策略树，计算最终得分 
        __calcTreeFinalScore_Method(canDownArray, __nextChessType(calcChessType));

        // 清除
        __clearDownAfterBoard(canDownArray, baseStep);
        
        // 4、最后，按照第一层的策略 subjectMaxScore 分数排序，从小到大 
        canDownArray.sort((a, b) => a.subjectMaxScore - b.subjectMaxScore);
        const minItem = canDownArray[0];
        const maxItem = canDownArray[canDownArray.length - 1];
        if(minItem && maxItem) {
            minItem.isMin = true;
            maxItem.isMax = true;
        }

        // 5、返回最终排序好的策略树 
        return canDownArray;
    }

    /**
     * 计算数组中每个落子方案的得分 （会克隆新数组，不影响原来数据）
     * @param canDownArray 落子方案数组
     * @param boardData 棋盘数据
     * @param downChessType 要落子的棋子类型
     * @param currentDepth 当前深度
     * @param iterationDepth 总迭代深度
     * @returns {[]} 所有策略（但不包括得分）
     */
    const __mockDownChessAndCalcScore = function (canDownArray, boardData, downChessType, currentDepth, iterationDepth) {

        canDownArray = copyArray(canDownArray);
        canDownArray.forEach(canDownChess => {

            const { downAfterBoard, tranArr } = __mockDownChess(boardData, canDownChess.x, canDownChess.y, downChessType);

            // 模拟落子 
            canDownChess.id = getXySimpleStr(canDownChess) + '__' + randomString(16); // 策略树节点唯一标识符
            canDownChess.type = downChessType;  // 棋子类型 
            canDownChess.showType = 'depth';  // 策略树显示模式
            canDownChess.downAfterBoard = downAfterBoard;// 模拟落子后的棋盘样子
            canDownChess.tranCount = tranArr.length; // 回收棋子数量

            canDownChess.blackStaticScore = calcStaticScore(canDownChess.downAfterBoard, 'black', canDownChess.x === -1);  // 此时的黑子盘面得分 
            canDownChess.whiteStaticScore = calcStaticScore(canDownChess.downAfterBoard, 'white', canDownChess.x === -1);  // 此时的白子盘面得分 
            canDownChess.weStaticScore = canDownChess[`${canDownChess.type}StaticScore`];  // 此时落子方的盘面得分 
            // canDownChess.enemyStaticScore = canDownChess[`${__nextChessType(canDownChess.type)}StaticScore`];  // 此时落子方敌对方的盘面得分 

            canDownChess.blackLeadScore = canDownChess.blackStaticScore - canDownChess.whiteStaticScore;  // 黑子领先得分 
            canDownChess.whiteLeadScore = canDownChess.whiteStaticScore - canDownChess.blackStaticScore;  // 白子领先得分 
            canDownChess.weLeadScore = canDownChess[`${canDownChess.type}LeadScore`];  // 此时落子方的领先得分 
            // canDownChess.enemyLeadScore = canDownChess[`${__nextChessType(canDownChess.type)}LeadScore`];  // 此时落子方敌对方的领先得分 

            canDownChess.currentDepth = canDownChess.currentDepth ?? currentDepth ?? 1;  // 当前迭代深度 

            // 计算迭代深度是否已完成 
            // currentDepth = currentDepth ?? 1;
            // currentDepth ++;
            if (canDownChess.currentDepth >= iterationDepth) {
                return;
            }

            // 向更深层迭代 
            // 此时对手应该的应对策略，继续向深层迭代
            const nextChessType = __nextChessType(canDownChess.type);
            const nextChessCanArray = getCanDownArray(canDownChess.downAfterBoard, nextChessType);
            // 如果没有落子方案，说明对手无子可落，塞个 x=-1, y=-1 的特殊对象进去 
            if(nextChessCanArray.length === 0) {
                const notDownChess = {
                    x: -1,
                    y: -1,
                    type: nextChessType,
                    tranCount: 0,
                }
                nextChessCanArray.push(notDownChess);
            }
            chaosArray(nextChessCanArray);
            canDownChess.nextChessCanArray = __mockDownChessAndCalcScore(nextChessCanArray, canDownChess.downAfterBoard, nextChessType, canDownChess.currentDepth + 1, iterationDepth);
        })

        return canDownArray;
    }

    const randomString = function(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var str = '';
        for (let i = 0; i < len; i++) {
            str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
    }
    
    /**
     * 为策略树中，每种策略计算最终得分（操作原数组，无需接受返回值）
     * @param canDownArray 策略树方案
     * @param chessType 棋子类型，指定是在为谁计算
     */
    const __calcTreeFinalScore_Method = function (canDownArray, chessType) {

        canDownArray.forEach(canDownChess => {
            // nextChessCanArray 不存在，或者为空数组，则说明已经遍历到了叶子节点，直接计算最终得分 
            if (!canDownChess.nextChessCanArray || canDownChess.nextChessCanArray.length === 0) {

                canDownChess.subjectType = chessType;  // 计算主体 棋子类型 
                canDownChess.subjectMaxScore = canDownChess[`${chessType}LeadScore`];  // 计算主体 最大得分
                canDownChess.subStrategyCount = 1; // 子孙策略数量
                
            } else {
                // 否则，继续向下迭代 
                __calcTreeFinalScore_Method(canDownChess.nextChessCanArray, chessType);

                // 按照 subjectMaxScore 值排序，从小到大 
                canDownChess.nextChessCanArray.sort((a, b) => a.subjectMaxScore - b.subjectMaxScore);

                // 比较：要求的 chessType 类型，和子策略组的 type 类型是否一致，
                //      如果一致：   代表子策略是己方行棋，取 subjectMaxScore 最高分 
                //      如果不一致： 代表子策略是对方行棋，取 subjectMaxScore 最低分（即：假设对手选择最优落子法）
                const childChessType = canDownChess.nextChessCanArray[0].type;
                canDownChess.subjectType = chessType;  // 计算主体 棋子类型 

                // 最低分和最高分
                const minItem = canDownChess.nextChessCanArray[0];
                const maxItem = canDownChess.nextChessCanArray[canDownChess.nextChessCanArray.length - 1];
                minItem.isMin = true;
                maxItem.isMax = true;
                if (chessType === childChessType) {
                    canDownChess.subjectMaxScore = maxItem.subjectMaxScore;
                } else {
                    canDownChess.subjectMaxScore = minItem.subjectMaxScore;
                }

                // 子孙策略数量
                canDownChess.subStrategyCount = 0;
                canDownChess.nextChessCanArray.forEach(item => {
                    canDownChess.subStrategyCount += item.subStrategyCount;
                })

            }

        })

    }

    // 【原创方法】清除 downAfterBoard 数据，加快 postMessage 传输速度
    /**
     * 为策略树中，每种策略计算最终得分（操作原数组，无需接受返回值）
     * @param canDownArray 策略树方案
     * @param parentItem_BaseStep 基础落子步骤，用于记录落子步骤
     */
    const __clearDownAfterBoard = function (canDownArray, parentItem_BaseStep) {

        canDownArray.forEach(canDownChess => {
            // 清除 downAfterBoard ，改为由 downAfterBoard_Step 记录落子步骤，这样在 postMessage 传输时，速度会快很多
            canDownChess.downAfterBoard = null;
            canDownChess.downAfterBoard_Step = [...copyArray(parentItem_BaseStep), {x: canDownChess.x, y: canDownChess.y}];

            if (canDownChess.nextChessCanArray && canDownChess.nextChessCanArray.length > 0) {
                __clearDownAfterBoard(canDownChess.nextChessCanArray, canDownChess.downAfterBoard_Step);
            }
            
        })

    }


    // ------------------------------ chess-funs 相关函数 ------------------------------
   
    // 创建一个背后棋子数据，用于背后的逻辑运算（相较于标准棋子，删减和增加一些用于背后计算的属性）
    const createBackChess = function (x, y, type) {
        return {
            x,   // x轴坐标 
            y,  // y轴坐标 
            type,  // 棋子类型 
            tranCount: 0,  // 此处落子可翻转的棋子数量 
            score: 0,  // 此处落子可得评分 
        }
    };

    // 计算下一个棋子类型 
    const __nextChessType = function (type) {
        if (type === 'black') {
            return 'white';
        }
        return 'black';
    }

    // 获取坐标的字符串描写简单形式，形如： A,1
    const getXySimpleStr = function (x, y) {
        if( typeof x === 'object' ) {
            y = x.y;
            x = x.x;
        }
        if(x === -1 && y === -1) {
            return '无子可落';
        }
        const xName = [
            '',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'
        ];
        return xName[x] + ',' + y;
    };

    // 一组棋子中是否包含指定棋子（根据坐标来判断） 
    const hasChessXy = function (arr, chess) {
        for (const item of arr) {
            if (equalsChessXy(item, chess)) {
                return true;
            }
        }
        return false;
    }
    
    // 两个棋子坐标是否相同
    const equalsChessXy = function (chess, chess2) {
        return chess.x === chess2.x && chess.y === chess2.y;
    }

    // 判断一个 格子/棋子 是否为 已经落子 状态
    const isDownChess = chess => {
        return chess && (chess.type === 'black' || chess.type === 'white');
    }

    
    // ------------------------------ board-calc 相关函数 ------------------------------

    const scoreMap = {
        'jiao': 30,  // 四角，30分 
        'jiaoPang': 10,  // 四角旁边，10分 
        'bian': 15, // 边，15分 
        'ciBian': -5, // 次边  
        'ciJiao': -15, // 次角，角的斜对位置
        'normal': 1, // 普通位置，1分 
    }
    
    // 模拟落子，返回落子后翻转应有旗子后的棋盘数据（会copy一份棋盘数据，不会变动原棋盘数据）
    const __mockDownChess = function(boardData, x, y, downType){
        const copyBoardData = __copyBoardData(boardData);

        // 如果是 x=-1, y=-1，则代表不落子
        if(x === -1 && y === -1) {
            return {
                downAfterBoard: copyBoardData,
                tranArr: []
            };
        }

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
            downAfterBoard: copyBoardData,
            tranArr: tranArr
        };
    };

    // 计算一个棋盘指定类型棋子的总得分 (tryCalcEnd=true时，尝试计算盘面是否已结束)
    const calcStaticScore = function (boardData, chessType, tryCalcEnd) {
        const { xCount, yCount } = getBoardXyCount(boardData);
        let score = 0;
        forEachBoardData(boardData, chess => {
            if(chess.type === chessType) {
                score += calcXyScore(chess, xCount, yCount);
            }
        })
        if(tryCalcEnd) {
            if(isEnd(boardData)) {
                const { blackCount, whiteCount } = getChessCountInfo(boardData);
                if(blackCount !== whiteCount) {
                    if(chessType ===  'black') {
                        score += blackCount > whiteCount ? 9999 : -9999;
                    } else {
                        score += whiteCount > blackCount ? 9999 : -9999;
                    }
                }
            }
        }
        return score;
    }

    // 获取一个棋盘中，指定棋子类型，所有可落子位置 
    const getCanDownArray = function (boardData, chessType) {
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
    
    // 计算指定坐标位置得分 
    const calcXyScore = function (chess, xCount, yCount) {
        const xyFuWeiName = calcXyFuWeiName(chess, xCount, yCount);
        return scoreMap[xyFuWeiName];
    }
    
    // 计算指定坐标位置棋子的所属符位名称 
    const calcXyFuWeiName = function (chess, xCount, yCount) {

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
    
    // 计算一个盘面是否已经结束 
    const isEnd = function (boardData) {
        return getCanDownArray(boardData, 'black').length === 0 && getCanDownArray(boardData, 'white').length === 0;
    };

    
    // ------------------------------ common-util 相关函数 ------------------------------
    
    // 随机打乱数组内元素顺序 
    const chaosArray = function (array) {
        array.sort((a, b) => Math.random() - 0.5);
    };
    
    // 拷贝一个数组 
    const copyArray = function (array) {
        const newArray = [];
        array.forEach(item => {
            newArray.push(copyObject(item));
        });
        return newArray;
    };

    // 拷贝一个对象 
    const copyObject = function (chess) {
        return JSON.parse(JSON.stringify(chess));
    };


    // ------------------------------ board-funs 相关函数 ------------------------------
    
    // 拷贝棋盘 
    const __copyBoardData = function (boardData) {
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

    // 遍历棋盘所有格子 (只遍历棋子数据，不包括填充格)
    const forEachBoardData = function (boardData, callback) {
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

    // 计算棋盘宽高数据 
    const getBoardXyCount = function (boardData) {
        // 首行和首列都是填充格，所以宽高等于数组长度减一 
        const xCount = boardData.length - 1;
        const yCount = boardData[1].length - 1;
        return {xCount, yCount};
    }
    
    // 获取棋盘中每种棋子的数量
    const getChessCountInfo = function (boardData) {
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

    // 设置指定坐标的棋子
    const setChessByXy = function (boardData, x, y, chess) {
        return boardData[y][x] = chess;
    };

    // 获取一个棋盘指定坐标的棋子
    const getChessByXy = function (boardData, x, y) {
        return boardData[y][x];
    };


    // ------------------------------ tran-funs 相关函数 ------------------------------

    // 在一个棋盘上，指定坐标落子后，计算需要翻转的棋子坐标列表 
    const getTranList = (boardData, downX, downY, downType) => {

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


    
    // 字符串压缩：参考于 https://juejin.cn/post/7232216049579311163
    const compress = function (strNormalString) {
        var strCompressedString = "";

        var ht = new Array();
        for(i = 0; i < 128; i++) {
            ht[i] = i;
        }

        var used = 128;
        var intLeftOver = 0;
        var intOutputCode = 0;
        var pcode = 0;
        var ccode = 0;
        var k = 0;

        for(var i=0; i<strNormalString.length; i++) {
            ccode = strNormalString.charCodeAt(i);
            k = (pcode << 8) | ccode;
            if(ht[k] != null) {
                pcode = ht[k];
            } else {
                intLeftOver += 12;
                intOutputCode <<= 12;
                intOutputCode |= pcode;
                pcode = ccode;
                if(intLeftOver >= 16) {
                    strCompressedString += String.fromCharCode( intOutputCode >> ( intLeftOver - 16 ) );
                    intOutputCode &= (Math.pow(2, (intLeftOver - 16)) - 1);
                    intLeftOver -= 16;
                }
                if(used < 4096) {
                    used ++;
                    ht[k] = used - 1;
                }
            }
        }

        if(pcode != 0) {
            intLeftOver += 12;
            intOutputCode <<= 12;
            intOutputCode |= pcode;
        }

        if(intLeftOver >= 16) {
            strCompressedString += String.fromCharCode( intOutputCode >> ( intLeftOver - 16 ) );
            intOutputCode &= (Math.pow(2,(intLeftOver - 16)) - 1);
            intLeftOver -= 16;
        }

        if( intLeftOver > 0) {
            intOutputCode <<= (16 - intLeftOver);
            strCompressedString += String.fromCharCode( intOutputCode );
        }

        return strCompressedString;
    }




    // -------------------------- 执行代码 


    const boardData = canDownChess.downAfterBoard;
    const calcChessType = __nextChessType(canDownChess.type);
    const currentDepth = canDownChess.currentDepth + 1;
    // const iterationDepth = iterationDepth;
    const baseStep = canDownChess.downAfterBoard_Step;

    // if(Math.random() > 0.5) {
    //     throw new Error('随机失败');
    // }
    
    const res = JSON.stringify({
        id: canDownChess.id,
        strategyTree: calcStrategyTree(boardData, calcChessType, iterationDepth)
    })
    return res;
    // return {
    //     id: canDownChess.id,
    //     strategyTree: calcStrategyTree(boardData, calcChessType, iterationDepth)
    // };
    



























}



