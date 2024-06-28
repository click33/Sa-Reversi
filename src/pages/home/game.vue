<!-- 对战页面 -->
<template>
    <div class="small--game-page">
        <!-- 顶层导航栏 -->
        <nav-top></nav-top>

        
        <!-- 大屏、左右布局 -->
        <div class="con-panel nav-content z-width" v-if="gameStore.isInit">

            <!-- 左边 -->
            <div class="con-panel-left">
                
                <!-- 棋盘 -->
                <div class="game-qp-box">
                    <game-board></game-board>
                </div>
                
                <!-- 对战数据 -->
                <com-battle-data style="margin-top: 10px;"></com-battle-data>
                
            </div>

            <!-- 右边 -->
            <div class="con-panel-right">

                <!-- 黑棋信息 -->
                <!-- <com-black-player-info style="margin-bottom: 14px;"></com-black-player-info>-->

                <!-- 白棋信息 -->
                <!--  <com-white-player-info style="margin-bottom: 14px;"></com-white-player-info>-->

                <!-- 房间信息 -->   
                <div class="com-room-info small-hide" style="margin-bottom: 10px;">
                    <com-room-info></com-room-info>
                </div>
                
                <!-- 消息打印机 -->
                <div class="com-message-box" style="margin-bottom: 10px;">
                    <com-message-box></com-message-box>
                </div>

                <!-- 房间信息 -->
                <div class="com-room-info small-show" style="margin-bottom: 10px;">
                    <com-room-info></com-room-info>
                </div>
                
                <!-- ad -->
<!--                <com-ad-box style="margin-top: 10px;"></com-ad-box>-->
                
            </div>

            <!-- 我方手指 -->
            <finger-chess ref="weFinger" camp="we" ></finger-chess>
            <!-- 敌方手指 -->
            <finger-chess ref="enemyFinger" camp="enemy" ></finger-chess>
            
        </div>

        <!-- 底部版权栏 -->
        <nav-bottom></nav-bottom>
        
    </div>
</template>

<script setup name="game">
import NavTop from '/@/pages-components/nav/nav-top.vue';
import NavBottom from '/@/pages-components/nav/nav-bottom.vue';
import GameBoard from './game/game-board.vue';
import ComBattleData from './game/com-battle-data.vue';
import {useGameStore} from "../../store/game";
import ComBlackPlayerInfo from "./game/com-black-player-info";
import ComWhitePlayerInfo from "./game/com-white-player-info";
import ComMessageBox from "./game/com-message-box";
import FingerChess from "./finger/finger-chess.vue";
import {useComStore} from "../../store/com";
import ComRoomInfo from "./game/com-room-info";
import ComAdBox from "./game/com-ad-box";
const gameStore = useGameStore();
const { proxy } = getCurrentInstance();
const comStore = useComStore();

onMounted(() => {
    if(! gameStore.isInit){
        gameStore.init();
    }
    
    // 保存全局组件句柄 
    nextTick(() => {
        comStore.weFinger = proxy.$refs['weFinger'];
        comStore.enemyFinger = proxy.$refs['enemyFinger'];
    })
    
    // 滚动条置顶
    window.scrollTo(0, 0);
    
})

onUnmounted(() => {
    gameStore.destroy();
})

</script>

<style scoped lang="scss">

// 整体面板
.con-panel{
    //border: 1px solid #000;
    min-height: 200px;
    margin: 14px auto;
}

.con-panel-left{
    float: left;
    width: 600px;
    //height: 650px;
    //min-height: calc(100vh - 48px - 150px);
    //background-color: #FFF;
    .game-qp-box{
        height: 600px;
        background-color: #FFF;
    }
    .com-room-info{
        margin-bottom: 20px;
    }
    .com-message-box{
        
    }
}

.con-panel-right{
    float: right;
    width: 280px;
    min-height: 200px;
    //border: 1px #000 solid;
    //background-color: #FFF;
}

// 小屏布局样式
//.small-show{
//    .game-qp-box{
//        height: 600px;
//        background-color: #FFF;
//    }
//}

</style>
