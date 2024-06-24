<!-- 对战页面 -->
<template>
    <div>
        <!-- 顶层导航栏 -->
        <nav-top></nav-top>
        
        <!-- 主体面板 -->
        <div class="con-panel z-width" v-if="gameStore.isInit">

            <!-- 左边 -->
            <div class="con-panel-left">
                <div class="game-qp-box">
                    <game-qi-pan></game-qi-pan>
                </div>
                
                <!-- 对战数据 -->
                <com-battle-data style="margin-top: 10px;"></com-battle-data>
                
            </div>

            <!-- 右边 -->
            <div class="con-panel-right">
                
                <!-- 黑棋信息 -->
                <com-black-player-info style="margin-bottom: 14px;"></com-black-player-info>

                <!-- 白棋信息 -->
                <com-white-player-info style="margin-bottom: 14px;"></com-white-player-info>

                <div class="com-message-box">
                    <com-message-box></com-message-box>
                </div>
                
            </div>

        </div>

        <!-- 底部版权栏 -->
        <nav-bottom></nav-bottom>

    </div>
</template>

<script setup name="game">
import NavTop from '/@/pages-components/nav/nav-top.vue';
import NavBottom from '/@/pages-components/nav/nav-bottom.vue';
import GameQiPan from './game/game-qi-pan.vue';
import ComBattleData from './game/com-battle-data.vue';
import {useGameStore} from "../../store/game";
import ComBlackPlayerInfo from "./game/com-black-player-info";
import ComWhitePlayerInfo from "./game/com-white-player-info";
import ComMessageBox from "./game/com-message-box";
const gameStore = useGameStore();

onMounted(() => {
    if(! gameStore.isInit){
        gameStore.init();
    }
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
        .com-message-box{
            height: 50px;
            line-height: 50px;
        }
    }
    
    .con-panel-right{
        float: right;
        width: 280px;
        min-height: 200px;
        //border: 1px #000 solid;
        //background-color: #FFF;
    }
</style>
