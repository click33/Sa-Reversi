<!-- 等级选择 -->
<template>
    <div>
        <!-- 顶层导航栏 -->
        <nav-top></nav-top>

        <div class="con-panel z-width vue-box">

            <div style="text-align: center; margin-top: 10vh;">

                <h1>黑白棋小游戏</h1>

                <div class="option-item">
                    <h2 class="right-to-left-1">选择执子</h2>
                    <el-radio-group class="right-to-left-2" v-model="selectStore.role">
                        <template v-for="item in dictStore.roleList">
                            <el-radio-button :label="item.name" :value="item.value" />
                        </template>
                    </el-radio-group>
                </div>
                <div class="option-item">
                    <h2 class="right-to-left-3">选择 AI 等级</h2>
                    <el-radio-group class="right-to-left-4" v-model="selectStore.level">
                        <template v-for="item in dictStore.levelList">
                            <el-radio-button :label="item.name" :value="item.value" />
                        </template>
                    </el-radio-group>
                </div>
                <div class="option-item">
                    <h2 class="right-to-left-5">我的名字</h2>
                    <el-input class="right-to-left-6" v-model="selectStore.playerName" style="width: 300px;">
                        <template #append>
                            <el-button icon="el-icon-Refresh" class="random-player-name" @click="selectStore.playerName = randomPlayerName()" > 随机一个 </el-button>
                        </template>
                    </el-input>
                </div>
                <div class="option-item right-to-left-7">
                    <h2>Debug选项</h2>
                    <p class="option-intro">此为开发调试选项，如无必要请勿勾选，会破坏游戏规则</p>
                    <el-checkbox v-model="selectStore.allowCoverDown">允许覆盖落子</el-checkbox>
                    <el-checkbox v-model="selectStore.allowForceDown">允许强制落子</el-checkbox>
                </div>
                <div class="option-item">
                    <!-- <h2>开始游戏</h2> -->
                    <el-button class="play-button right-to-left-9" type="primary" color="#337be2" size="large" @click="play">开始游戏</el-button>
                </div>
            </div>

        </div>

        <!-- 底部版权栏 -->
        <nav-bottom></nav-bottom>

    </div>
</template>

<script setup name="home-select">
import NavTop from '/@/pages-components/nav/nav-top.vue';
import NavBottom from '/@/pages-components/nav/nav-bottom.vue';
import { randomPlayerName } from "../../algo/random-player-name";
import router from "../../router";
import {useGameStore} from "../../store/game";
import {useSelectStore} from "../../store/select";
import {useDictStore} from "../../store/dict";
let gameStore = useGameStore();
let selectStore = useSelectStore();
let dictStore = useDictStore();

// 点击开始游戏，跳转到对战页面
const play = () => {
    // 根据用户的选择，初始化 gameStore 一些参数
    if(selectStore.role === 'black') {
        gameStore.blackAuto = false;
        gameStore.whiteAuto = true;
    } else {
        gameStore.blackAuto = true;
        gameStore.whiteAuto = false;
    }

    // 初始化棋盘
    gameStore.init();

    // 缓存选择的信息
    selectStore.setSelectStore();

    // 跳转到对战页面 
    router.push('/game');
}

// 监听 gameStore，用户改动时，缓存下来
watch(selectStore, () => {
    selectStore.setSelectStore();
})

</script>

<style scoped lang="scss">
// 整体面板
.con-panel{
    //border: 1px solid #000;
    min-height: 200px;
    margin: 14px auto;
}

.option-item{
    margin-top: 50px;
    h2{ margin-bottom: 20px; }
    .option-intro{
        color: #999;
        margin-bottom: 10px;
    }
}

.random-player-name{
    :deep(.el-icon){
        position: relative;
        top: 2px;
    }
}

// 开始按钮 
.play-button{
    width: 300px;
}

</style>
