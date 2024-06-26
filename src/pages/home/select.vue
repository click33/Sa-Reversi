<!-- 等级选择 -->
<template>
    <div>
        <!-- 顶层导航栏 -->
        <nav-top></nav-top>

        <div class="con-panel z-width vue-box">

            <div style="margin-top: 10vh;">

                <h1>黑白棋小游戏</h1>
                <br><br><br>

                <el-form-item label="黑子角色：" class="option-item right-to-left-1">
                    <div class="right-to-left-3">
                        <el-radio-group v-model="selectStore.blackRole">
                            <template v-for="item in dictStore.aiRoleList">
                                <el-radio-button :label="item.name" :value="item.id" />
                            </template>
                        </el-radio-group>
                        <p class="option-intro"> 
                            <span v-if="selectStore.blackRole === 'user'">玩家手动执黑子</span>
                            <span v-else>由 AI ({{ dictStore.getAIRole( selectStore.blackRole ).name }}) 执黑子</span>
                        </p>
                    </div>
                </el-form-item>
                
                <el-form-item label="白子角色：" class="option-item right-to-left-2">
                    <div class="right-to-left-4">
                        <el-radio-group v-model="selectStore.whiteRole">
                            <template v-for="item in dictStore.aiRoleList">
                                <el-radio-button :label="item.name" :value="item.id" />
                            </template>
                        </el-radio-group>
                        <p class="option-intro">
                            <span v-if="selectStore.whiteRole === 'user'">玩家手动执白子</span>
                            <span v-else>由 AI ({{ dictStore.getAIRole( selectStore.whiteRole ).name }}) 执白子</span>
                        </p>
                    </div>
                </el-form-item>
                
                <el-form-item label="辅助选项：" class="option-item right-to-left-3">
                    <div class="right-to-left-5">
                        <el-checkbox v-model="selectStore.tipsDown">提示落子位置</el-checkbox>
                        <el-checkbox v-model="selectStore.tipsDownTranCount">提示落子可回收棋子数量</el-checkbox>
                        <el-checkbox v-model="selectStore.tipsDownScore">提示落子得分</el-checkbox>
                        <p class="option-intro">新手按需勾选，老手不建议勾选，会降低自身棋力水平</p>
                    </div>
                </el-form-item>

                <el-form-item label="调试选项：" class="option-item right-to-left-4">
                    <div class="right-to-left-6">
                        <el-checkbox v-model="selectStore.allowCoverDown">允许覆盖落子</el-checkbox>
                        <el-checkbox v-model="selectStore.allowForceDown">允许强制落子</el-checkbox>
                        <p class="option-intro">此为开发调试选项，如无必要请勿勾选，会破坏游戏规则</p>
                    </div>
                </el-form-item>

                <el-form-item label="棋盘大小：" class="option-item right-to-left-5" style="margin-bottom: 50px;">
                        <div class="xy-count-input-box right-to-left-5">
                            <el-input class="xy-count-input" v-model="selectStore.xCount" 
                                      type="number" @blur="checkXCountYCount"></el-input>
                            <span class="xy-count-x"> x </span>
                            <el-input class="xy-count-input" v-model="selectStore.yCount"
                                      type="number" @blur="checkXCountYCount"></el-input>
                        </div>
                        <el-slider class="xy-count-slider right-to-left-7" v-model="selectStore.xyCount" 
                                   :min="dictStore.boardMinLength" :max="dictStore.boardMaxLength"
                                   show-tooltip :step="1" 
                                   :format-tooltip="value => value + ' x ' + value"
                                   :marks="dictStore.boardLengthMarks" />
                </el-form-item>

                <el-form-item label="我的名字：" class="option-item right-to-left-6">
                    <el-input class="right-to-left-8" v-model="selectStore.playerName" style="width: 300px;">
                        <template #append>
                            <el-button icon="el-icon-Refresh" class="random-player-name" @click="selectStore.playerName = randomPlayerName()" > 随机一个 </el-button>
                        </template>
                    </el-input>
                </el-form-item>
                
                <el-form-item class="option-item right-to-left-7" style="margin-top: 40px;">
                    <el-button class="play-button right-to-left-9" type="primary" color="#337be2" size="large" @click="play">开始游戏</el-button>
                </el-form-item>

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
    // 根据用户的选择，初始化一些参数

    selectStore.xCount = parseInt(selectStore.xCount);
    selectStore.yCount = parseInt(selectStore.yCount);

    // 缓存选择的信息
    selectStore.setSelectStoreToLocal();

    // 初始化棋盘
    // gameStore.init();
    gameStore.isInit = false;
    
    // 跳转到对战页面 
    router.push('/game');
    
}

// 监听 gameStore，用户改动时，缓存下来
watch(selectStore, () => {
    selectStore.setSelectStoreToLocal();
})
watch(() => selectStore.xyCount, () => {
    selectStore.xCount = selectStore.xyCount;
    selectStore.yCount = selectStore.xyCount;
})

// xCount、yCount 必须为合法值 
const checkXCountYCount = () => {
    if (selectStore.xCount < dictStore.boardMinLength) {
        selectStore.xCount = dictStore.boardMinLength;
    }
    if (selectStore.xCount > dictStore.boardMaxLength) {
        selectStore.xCount = dictStore.boardMaxLength;
    }
    if (selectStore.yCount < dictStore.boardMinLength) {
        selectStore.yCount = dictStore.boardMinLength;
    }
    if (selectStore.yCount > dictStore.boardMaxLength) {
        selectStore.yCount = dictStore.boardMaxLength;
    }
    if (selectStore.xCount === selectStore.yCount) {
        selectStore.xyCount = parseInt(selectStore.xCount);
    }
}

</script>

<style scoped lang="scss">
// 整体面板
.con-panel{
    //border: 1px solid #000;
    min-height: 200px;
    margin: 14px auto;
}

.option-item{
    h2{ margin-bottom: 20px; color: #000; }
    
    :deep(.el-form-item__label){
        color: #333;
        font-weight: bold;
        font-size: 16px;
    }
    
    .option-intro{
        color: #999;
        margin-bottom: 10px;
    }
    
    // 棋盘大小控制
    .xy-count-input-box{ width: 120px; }
    .xy-count-input{ width: 45px; }
    .xy-count-x{ display: inline-block; margin: 0 10px; }
    .xy-count-slider{width: calc( 100% - 140px ); margin-left: 20px;}
    
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
