<!-- 房间信息展示 -->
<template>
    <el-card class="con-box zdy-card fade-in-ys" header="对局信息">
        <div class="info-box">
            <!-- 一项信息 -->
            <div class="info-item">
                <div class="info-role">游戏：</div>
                <p class="info-p-warning right-to-left-0">{{ settingStore.title }}</p>
            </div>
            <!-- 一项信息 -->
            <div class="info-item">
                <div class="info-role">版本：</div>
                <p class="info-p-warning right-to-left-1">{{ settingStore.version }}</p>
            </div>
            <!-- 一项信息 -->
            <div class="info-item">
                <div class="info-role">棋盘：</div>
                <p class="info-p-warning right-to-left-2">
                    <span>{{ selectStore.xCount }} x {{ selectStore.yCount }} </span>
                    <span v-if="selectStore.xCount === selectStore.yCount">
                        <span v-if="dictStore.boardLengthMarks[selectStore.xCount]">
                            （{{ dictStore.boardLengthMarks[selectStore.xCount] }}）
                        </span>
                    </span>
                </p>
            </div>
            <!-- 一项信息 -->
            <div class="info-item">
                <div class="info-role">黑子：</div>
                <p class="info-p-warning right-to-left-3" v-if="selectStore.blackRole === 'user' ">{{ selectStore.username }} （玩家）</p>
                <p class="info-p-warning right-to-left-3" v-else>{{ dictStore.getRole( selectStore.blackRole ).name }} （AI）</p>
            </div>
            <!-- 一项信息 -->
            <div class="info-item">
                <div class="info-role">白子：</div>
                <p class="info-p-warning right-to-left-4" v-if="selectStore.whiteRole === 'user' ">{{ selectStore.username }} （玩家）</p>
                <p class="info-p-warning right-to-left-4" v-else>{{ dictStore.getRole( selectStore.whiteRole ).name }} （AI）</p>
            </div>
            <!-- 一项信息 -->
            <div class="info-item">
                <div class="info-role">状态：</div>
                <p class="info-p-success right-to-left-5">
                    <span class="fade-in-ys" v-if=" ['defDown'].includes(gameStore.status) ">棋盘初始化...</span>
                    <span class="fade-in-ys" v-if=" ['userDown', 'tran'].includes(gameStore.status) ">游戏中...</span>
                    <span class="fade-in-ys" v-if=" ['end'].includes(gameStore.status) ">对局结束</span>
                </p>
            </div>
            <!-- 一项信息 -->
            <div class="info-item">
                <div class="info-role">执子：</div>
                <p class="info-p-info right-to-left-6">
                    <span class="fade-in-ys2" v-if="gameStore.currentPlayerType === 'black'">等待黑方落子...</span>
                    <span class="fade-in-ys2" v-else>等待白方落子...</span>
                </p>
            </div>
        </div>
    </el-card>
</template>

<script setup name="com-room-info">
import {reactive} from "vue";
import {useGameStore} from "../../../store/game";
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {useSettingStore} from "../../../store/setting";
const gameStore = useGameStore();
const selectStore = useSelectStore();
const dictStore = useDictStore();
const settingStore = useSettingStore();


// ------------------ 数据 ------------------
const state = reactive({
    // infoList: [],  // 展现信息列表
});

// ------------------ 方法 ------------------


</script>

<style scoped lang="scss">
.con-box{
    width: 100%;
    //background-color: #fff;
    background-color: #272822;
    border: 1px solid #000;
    box-shadow: 0 0 5px #333;
    //background-color: #fff;
    
    :deep(.el-card__header) {padding-left: 18px; color: #EEE; border-bottom: 1px #555 solid; }
    :deep(.el-card__body) {padding: 0;}
}
.info-box{ padding: 20px 12px 15px 14px; }


// 一条消息 
.info-item{ overflow: hidden; margin-bottom: 6px; line-height: 20px; font-size: 12px;}
.info-role{
    width: 3.5em;
    .info-p{ width: calc(100% - 4em); }
    
    float: left;
    font-weight: 700;
    text-align: right;
    color: #EEE;
}

// 不同消息类型，需要不同的颜色
.info-p{display: inline-block; }
.info-p-info{ color: #bbb; .gb-cursor{background-color: #888;} }
.info-p-error{ color: red; .gb-cursor{background-color: red;} }
.info-p-success{ color: #68E868; .gb-cursor{background-color: #68E868;} }
.info-p-warning{ color: #E6A23C; .gb-cursor{background-color: #E6A23C;} }
//.info-p-info,.info-p-error, .info-p-success, .info-p-warning{
//    opacity: 0;
//    animation-name: fade-in;
//    animation-duration: 0.5s;
//    animation-fill-mode: forwards;
//    animation-delay: 0.1s;
//}

// 渐变进入
.fade-in-ys2 {
    opacity: 0;
    animation-name: fade-in;
    animation-duration: 0.2s;
    animation-fill-mode: forwards;
    animation-delay: 0s;
}

</style>
