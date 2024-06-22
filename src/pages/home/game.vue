<!-- 对战页面 -->
<template>
    <div>
        <!-- 顶层导航栏 -->
        <nav-top></nav-top>
        
        <!-- 主体面板 -->
        <div class="con-panel z-width" v-if="gameStore.isInit">

            <!-- 左边 -->
            <div class="con-panel-left">
                <game-qi-pan></game-qi-pan>
            </div>

            <!-- 右边 -->
            <div class="con-panel-right">
                
                <!-- 对手信息 -->
                <com-ai-info style="margin-bottom: 14px;"></com-ai-info>

                <!-- 用户信息 -->
                <com-user-info style="margin-bottom: 14px;"></com-user-info>

                <!-- 对战数据 -->
                <com-battle-data></com-battle-data>
                
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
import ComAiInfo from './game/com-ai-info.vue';
import ComUserInfo from './game/com-user-info.vue';
import ComBattleData from './game/com-battle-data.vue';
import {useGameStore} from "../../store/game";
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
        height: 600px;
        //min-height: calc(100vh - 48px - 150px);
        background-color: #FFF;
    }
    
    .con-panel-right{
        float: right;
        width: 280px;
        min-height: 200px;
        //border: 1px #000 solid;
        //background-color: #FFF;
    }
</style>
