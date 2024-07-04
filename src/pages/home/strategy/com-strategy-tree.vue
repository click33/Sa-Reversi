<!-- 策略树信息展示 -->
<template>
    <el-scrollbar class="con-box-st zdy-card small-com-strategy-tree fade-in-ys">
        <div class="info-box">
            <el-tree
                :data="gameStore.strategyTree"
                :props="state.props"
                empty-text=""
            >
                <template #default="{ node, data }">
                    <p class="tree-content-item" :class=" 'tci-' + data.id " v-if="data.id === 'black-top' || data.id === 'white-top' ">
                        <span>{{ (data.type === 'black' ? '黑子' : '白子') }} 策略树</span>
                        <span v-if="data.roleName"> ({{ data.roleName }}) </span>
                        <span>，变化: {{ data.subStrategyCount }}</span>
                        <span v-if="data.showType === 'tran' ">，最多可回收: {{ data.maxTranCount }} 枚</span>
                        <span v-else>，最大可得分: {{ data.subjectMaxScore }}</span>
                        <span v-if="data.showType === 'depth'"> (计算耗时: {{ data.costTime / 1000 }} s)</span>
                    </p>
                    <p class="tree-content-item" :class=" 'tci-' + data.id " v-else>
                        <span>{{ (data.type === 'black' ? '黑子' : '白子') }} {{ getXyStr(data) }}</span>
                        <template v-if="data.showType === 'tran'">
                            <span>，回收: {{ data.tranCount }} 枚</span>
                        </template>
                        <template v-else-if="data.showType === 'score'">
                            <span>，回收: {{ data.tranCount }} 枚 </span>
                            <span>，评分: {{ data.score }} </span>
                        </template>
                        <template v-else-if="data.showType === 'depth'">
                            <span>，变化: {{ data.subStrategyCount }}</span>
                            <span>，评分: {{ data.weLeadScore }} </span>
                            <span>，{{getSubjectName(data)}}最大可得分: {{ data.subjectMaxScore }}</span>
                        </template>
                        <span class="min-max-tips" v-if="data.isMin"> (min)</span>
                        <span class="min-max-tips" v-if="data.isMax"> (max)</span>
                        <span class="cz-btn">
                            <el-link type="primary" @click.stop="printStrategy(data)">data</el-link>
                            <el-link type="primary" style="margin-left: 6px;" @click.stop="printBoardData(data)">board</el-link>
                        </span>
                    </p>
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
import {useSettingStore} from "../../../store/setting";
import {__nextChessType, getXyStr} from "../../../algo/playing-chess/chess-funs";
import {getBoardToString} from "../../../algo/playing-chess/board-funs";
import ComStrategyTreeItem from "./com-strategy-tree-item.vue";
const gameStore = useGameStore();
const selectStore = useSelectStore();
const dictStore = useDictStore();
const settingStore = useSettingStore();


// ------------------ 数据 ------------------
const state = reactive({
    props: {
        value: 'id',
        label: 'label',
        children: 'nextChessCanArray',
    },
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


defineExpose({
    expandTree
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
    }
    
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
    .cz-btn{float: right; margin-right: 10px;}
    
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
