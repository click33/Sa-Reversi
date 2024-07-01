<!-- 策略树信息展示 -->
<template>
    <el-scrollbar class="con-box-st zdy-card small-com-strategy-tree fade-in-ys">
        <div class="info-box">
<!--            <div class="in-calc-tips" v-if="gameStore.inCalcStrategy">-->
<!--                <el-icon-Loading class="in-calc-tips-i"></el-icon-Loading>-->
<!--                <br>-->
<!--                <span class="in-calc-tips-txt">计算中...</span>-->
<!--            </div>-->
            <el-tree
                :data="gameStore.strategyTree"
                :props="state.props"
                empty-text=""
            >
                <template #default="{ node, data }">
                    <p class="tree-content-item tree-content-item-top" v-if="data.id === 'top'">
                        <span>{{ (data.type === 'black' ? '黑子' : '白子') }} 策略树</span>
                        <span>，{{ data.subStrategyCount }} 变化</span>
                        <span>，{{getStrategyChessTypeName()}}评分: {{ data.finalScore }}</span>
                    </p>
                    <p class="tree-content-item" v-else>
                        <span>{{ (data.type === 'black' ? '黑子' : '白子') }} {{ getXyStr(data) }}</span>
                        <span>，{{ data.subStrategyCount ?? 1 }} 变化</span>
                        <span>，{{getStrategyChessTypeName()}}评分: {{ data.finalScore }}</span>
                        <span class="min-max-tips" v-if="data.isMin"> (min) </span>
                        <span class="min-max-tips" v-if="data.isMax"> (max) </span>
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
import {reactive} from "vue";
import {useGameStore} from "../../../store/game";
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {useSettingStore} from "../../../store/setting";
import {getBoardToString, getXyStr} from "../../../algo/playing-chess/ai-calc-coomon";
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
const getStrategyChessTypeName = () => {
    if(gameStore.strategyChessType === 'black'){
        return '黑子';
    }
    if(gameStore.strategyChessType === 'white'){
        return '白子';
    }
    return 'xx';
}


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
