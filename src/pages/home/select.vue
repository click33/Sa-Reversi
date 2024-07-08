<!-- 等级选择 -->
<template>
    <div class="small--select-page">
        <!-- 顶层导航栏 -->
        <nav-top></nav-top>

        
        <div class="con-panel nav-content z-width vue-box">
            <el-scrollbar class="con-panel-scroll">
                <div class="con-panel-2 bottom-to-top-ys">
                    <com-select mode="page"></com-select>
                    <div style="height: 100px;"></div>
                </div>
                <div class="option-item play-button-box right-to-left-7" style="margin-top: 40px;">
                    <el-button class="play-button right-to-left-9" type="primary" color="#337be2" size="large" @click="play">开始游戏</el-button>
                </div>
            </el-scrollbar>
        </div>

        <!-- 底部版权栏 -->
        <nav-bottom></nav-bottom>

    </div>
</template>

<script setup name="home-select">
import NavTop from '/@/pages-components/nav/nav-top.vue';
import NavBottom from '/@/pages-components/nav/nav-bottom.vue';
import router from "../../router";
import {useGameStore} from "../../store/game";
import ComSelect from "./select/com-select";
let gameStore = useGameStore();

// 点击开始游戏，跳转到对战页面
const play = () => {
    // 根据用户的选择，初始化一些参数

    // selectStore.xCount = parseInt(selectStore.xCount);
    // selectStore.yCount = parseInt(selectStore.yCount);

    // 缓存选择的信息
    // selectStore.setSelectStoreToLocal();

    // 初始化棋盘
    // gameStore.init();
    gameStore.isInit = false;
    
    // 跳转到对战页面 
    router.push('/game');
    
}

</script>

<style scoped lang="scss">
// 整体面板
.con-panel{
    //border: 1px solid #000;
    //margin: 5vh auto 0;
    position: relative;
    margin-top: 14px;
    margin-bottom: 14px;
    background-color: transparent;
    //*{color: #333;}
}
.con-panel-scroll{
    height: calc(100vh - 60px - 60px - 50px);
    background-color: rgba(255, 255,255, 0.5);
}
.con-panel-2{
    padding: 50px 100px;
    position: static;
    
}

// 开始按钮 
.play-button-box{
    position: absolute; 
    bottom: 0px;
    height: 80px;
    line-height: 80px;
    width: 100%;
    background-color: rgba(221, 221, 221, 0.7);
    border-top: 1px #bbb solid;
    text-align: center;
}
.play-button{
    width: 500px;
    max-width: 70%;
}

</style>
