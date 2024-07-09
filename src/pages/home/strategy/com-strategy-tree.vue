<!-- 策略树信息展示 -->
<template>
    <el-scrollbar class="con-box-st zdy-card small-com-strategy-tree fade-in-ys">
        <div class="info-box">
            <el-tree
                :data="state.strategyTree"
                :props="state.props"
                :load="loadNode"
                lazy
                empty-text=""
            >
                <template #default="{ node, data }">
                    <p class="tree-content-item" :class=" 'tci-' + data.id " v-if="data.id === 'black-top' || data.id === 'white-top' ">
                        <span>{{ (data.type === 'black' ? '黑子' : '白子') }} 策略树</span>
                        <span v-if="data.roleName"> ({{ data.roleName }}) </span>
                        <span>, 变化 {{ data.subStrategyCount }}</span>
                        <span v-if="data.showType === 'tran' ">, 最多可回收: {{ data.maxTranCount }} 枚</span>
                        <span v-else>, 最大可得分: {{ data.subjectMaxScore }}</span>
                        <span v-if="data.showType === 'depth'"> (计算耗时: {{ data.costTime / 1000 }} s)</span>
                    </p>
                    <template v-else>
                        <!-- 计算中 -->
                        <p v-if="data.calcStatus === 'calc'" class="tree-content-item tree-content-item-call">
                            <span>{{ (data.type === 'black' ? '黑子' : '白子') }} {{ getXyStr(data) }}</span>
                            <span>，变化：计算中...</span>
                            <span>，评分: 计算中...</span>
<!--                            <span>，耗时: {{ data.costTime }} 秒</span>-->
                        </p>
                        <!-- 计算失败 -->
                        <p v-else-if="data.calcStatus === 'fail'" class="tree-content-item tree-content-item-fail">
                            <span>{{ (data.type === 'black' ? '黑子' : '白子') }} {{ getXyStr(data) }}</span>
                            <span>，计算失败：{{ data.errorMessage }}</span>
                        </p>
                        <!-- 计算成功 -->
                        <p v-else class="tree-content-item" :class=" 'tci-' + data.id ">
                            <span>{{ (data.type === 'black' ? '黑子' : '白子') }} {{ getXyStr(data) }}</span>
                            <template v-if="data.showType === 'tran'">
                                <span>, 回收: {{ data.tranCount }} 枚</span>
                            </template>
                            <template v-else-if="data.showType === 'score'">
                                <span>, 回收: {{ data.tranCount }} 枚 </span>
                                <span>, 评分: {{ data.score }} </span>
                            </template>
                            <template v-else-if="data.showType === 'depth'">
                                <span>, 变化 {{ data.subStrategyCount }}</span>
                                <span>, 评分: {{ data.weLeadScore }} </span>
                                <span>, {{getSubjectName(data)}}最高得分: {{ data.subjectMaxScore }}</span>
                            </template>
                            <span class="min-max-tips" v-if="data.isMin && !data.isMax"> min</span>
                            <span class="min-max-tips" v-if="data.isMax"> max</span>
                            <span class="cz-btn">
                            <el-link type="primary" @click.stop="printStrategy(data)">data</el-link>
                            <el-link type="primary" style="margin-left: 6px;" @click.stop="printBoardData(data)">board</el-link>
                        </span>
                        </p>
                        
                    </template>
                </template>
            </el-tree>
            <div style="height: 100px;"></div>
        </div>
    </el-scrollbar>
</template>

<script setup name="com-strategy-tree">
import {nextTick, reactive} from "vue";
import {useGameStore} from "../../../store/game";
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {__nextChessType, getXyStr} from "../../../algo/playing-chess/chess-funs";
import {getBoardToString} from "../../../algo/playing-chess/board-funs";
import {copyProperty} from "../../../algo/playing-chess/common-util";
import {__mockDownChess} from "../../../algo/playing-chess/board-calc";
const gameStore = useGameStore();
const selectStore = useSelectStore();
const dictStore = useDictStore();


// ------------------ 数据 ------------------
const state = reactive({
    props: {
        value: 'id',
        label: 'label',
        isLeaf: 'leaf',
        children: 'nextChessCanArray',
    },
    // 真正显示的策略树数据
    // 采用懒加载模式，可以使树的节点展示更流畅，性能提供50倍以上
    //      非懒加载模式，深度计算3层，500多变化，页面卡死四五秒左右
    //      懒加载模式后，深度计算5层，3万多变化，页面2秒多展示完毕 
    strategyTree: [
        
    ],
    // 耗时计算定时器句柄
    // costTimeInterval: null
});

// ------------------ 方法 ------------------

// 展开某个类型的策略树节点，同事折叠另一个 
const expandTree = (type) => {
    nextTick(() => {
        // 使顶级节点展开 
        const dom = document.querySelector(`.tci-${type}-top`);
        if(dom && dom.parentElement.parentElement.classList.contains('is-expanded') === false) {
            dom.click();
        }
        // 折叠另一个节点
        const nextType = __nextChessType(type);
        const dom2 = document.querySelector(`.tci-${nextType}-top`);
        if(dom2 && dom2.parentElement.parentElement.classList.contains('is-expanded') === true) {
            dom2.click();
        }
        
    });
}

// 打印指定策略树节点下的棋盘数据
const printBoardData = (data) => {
    sa.msg('已将棋盘数据打印在f12控制台');
    if(!data.downAfterBoard) {
        const subjectType = data.subjectType;
        const topItem = subjectType === 'black' ? state.strategyTree[0] : state.strategyTree[1];
        let firstItem = null;
        const firstXy = data.downAfterBoard_Step[0];
        topItem.nextChessCanArray.forEach(item => {
           if(item.x === firstXy.x && item.y === firstXy.y) {
               firstItem = item;
           } 
        });
        let downAfterBoard = firstItem.downAfterBoard;
        let downChessType = firstItem.type;
        data.downAfterBoard_Step.forEach((item, index) => {
            if(index === 0) {
                return;
            }
            downChessType = __nextChessType(downChessType);
            downAfterBoard = __mockDownChess(downAfterBoard, item.x, item.y, downChessType).downAfterBoard;
        });
        data.downAfterBoard = downAfterBoard;
    }
    console.log(getBoardToString(data.downAfterBoard));
}

// 打印指定策略树节点对象 
const printStrategy = (data) => {
    sa.msg('已将策略数据打印在f12控制台');
    console.log(data);
}

// 获取当前策略树是在给谁评分
const getSubjectName = (data) => {
    if(data.subjectType === 'black'){
        return '黑子';
    }
    if(data.subjectType === 'white'){
        return '白子';
    }
    return '未知';
}

// 加载子节点 
const loadNode = (node, resolve) => {
    // console.log('加载子节点：', node);
    // 加载顶层节点
    if(node.id === 0){
        const strategyTree = [{}, {}];
        copyProperty(gameStore.strategyTree[0], strategyTree[0]);
        copyProperty(gameStore.strategyTree[1], strategyTree[1]);
        strategyTree.forEach(item => {
            item.nextChessCanArray = [{}];
        });
        resolve(strategyTree);
    } else {
        // 加载某个子节点
        const strategy = findNode(gameStore.strategyTree, node.data.id);
        if(strategy && strategy.nextChessCanArray && strategy.nextChessCanArray.length > 0) {
            const arr = [];
            strategy.nextChessCanArray.forEach(item => {
                const item2 = copyProperty(item, {});
                item2.leaf = !(item2.nextChessCanArray && item2.nextChessCanArray.length > 0);
                item2.nextChessCanArray = [];
                arr.push(item2);
            })
            resolve(arr);
        } else {
            resolve([]);
        }
    }
}

// 刷新第一组节点数据
const refreshFirstNode = (chessType) => {
    const strategyItem0 = copyProperty(gameStore.strategyTree[0], {});
    strategyItem0.leaf = false;
    // strategyItem0.nextChessCanArray = [];
    const itemArr0 = [];
    strategyItem0.nextChessCanArray.forEach(item => {
        const item2 = copyProperty(item, {});
        item2.nextChessCanArray = [];
        item2.leaf = false;
        itemArr0.push(item2);
    })
    strategyItem0.nextChessCanArray = itemArr0;

    const strategyItem1 = copyProperty(gameStore.strategyTree[1], {});
    strategyItem1.leaf = false;
    // strategyItem1.nextChessCanArray = [];
    const itemArr1 = [];
    strategyItem1.nextChessCanArray.forEach(item => {
        const item2 = copyProperty(item, {});
        item2.nextChessCanArray = [];
        item2.leaf = false;
        itemArr0.push(item2);
    })
    strategyItem1.nextChessCanArray = itemArr1;

    state.strategyTree = [strategyItem0, strategyItem1];
}

// 显示计算耗时数据 
const showCostTime = (chessType, costTime) => {
    const strategyTreeItem = chessType === 'black' ? state.strategyTree[0] : state.strategyTree[1];
    if(strategyTreeItem) {
        strategyTreeItem.costTime = costTime;
    }
}

// 遍历策略树，查找某个id子节点 
const findNode = (strategyTree, id) => {
    for (let i = 0; i < strategyTree.length; i++) {
        const item = strategyTree[i];
        if(item.id === id){
            return item;
        }
        if(item.nextChessCanArray && item.nextChessCanArray.length > 0){
            const item2 = findNode(item.nextChessCanArray, id);
            if(item2){
                return item2;
            }
        }
    }
    return null;
}

defineExpose({
    expandTree,
    refreshFirstNode,
    showCostTime
})


// 组件加载时
onMounted(()=> {
    
    
})

// 组件注销时
onUnmounted(() => {
   
})


</script>

<style scoped lang="scss">
.con-box-st{
    width: 100%;
    //max-width: 95vw;
    //background-color: #fff;
    background-color: #272822;
    //border: 1px solid #000;
    box-shadow: 0 0 5px #333;
    //background-color: #fff;
    
    :deep(.el-card__header) {padding-left: 18px; color: #EEE; border-bottom: 1px #555 solid; }
    :deep(.el-card__body) {padding: 0;}
}
.info-box{ 
    padding: 20px 12px 15px 14px;
    max-height: 80vh;
    //:deep(.el-vl__window) {
    //    height: 600px !important;
    //}
    :deep(.el-tree) {
        color: #bbb;
        background-color: rgba(0,0,0,0);
    }
    :deep(.el-tree-node__content){
        background-color: rgba(0,0,0,0);
        &:hover{
            background-color: #000;
        }
    }
    
    .tree-content-item{
        width: 95%;
        font-size: 13px;
        position: relative;
    }
    .tree-content-item-call{color: #aaa;}
    .tree-content-item-fail{color: #aaa;}
    
    // 每层不一样的颜色，让肉眼更容易分辨 
    :deep(.el-tree){
        font-weight: 400;
        .el-tree-node__content{ color: #f00; }
        .el-tree-node__children  .el-tree-node__content{ color: #f22; }
        .el-tree-node__children .el-tree-node__children .el-tree-node__content{ color: #68E868; }
        .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__content{ color: #E6A23C; }
        .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__content{ color: #65D8DB; }
        .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__content{ color: #aaa; }
    }
    .tci-black-top, .tci-white-top{color: #FFF;}
    
    // 最大最小
    .min-max-tips{margin-left: 5px;color: #DA70D6;}
    // 
    .cz-btn{position: absolute; right: 0px;}
    
}

// 整下计算中的提示信息
.in-calc-tips{
    text-align: center;
    color: #ccc;
    .in-calc-tips-i{width: 30px; animation: man 3s linear infinite; }
    @keyframes man {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
    }
    .in-calc-tips-txt{display: inline-block; margin-top: 10px; margin-left: 10px;}
}


</style>
