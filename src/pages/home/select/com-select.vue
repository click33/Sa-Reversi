<!-- 配置器 -->
<template>
    <div class="con-box">
        <div>
            <h2 class="con-title">对局配置</h2>
            
            <el-form-item label="黑子角色：" class="option-item right-to-left-1">
                <div class="right-to-left-3">
                    <el-radio-group v-model="selectStore.blackRole">
                        <template v-for="item in dictStore.roleList">
                            <el-radio-button :label="item.name" :value="item.id" />
                        </template>
                    </el-radio-group>
                    <div class="chess-role-strong">
                        <div class="ss-checkbox-box">
                            <el-checkbox v-model="selectStore.blackOneHornStrong">占一角</el-checkbox>
                            <el-checkbox v-model="selectStore.blackHornStrong">占四角</el-checkbox>
                            <el-checkbox v-model="selectStore.blackEdgeStrong">占四边</el-checkbox>
                            <el-checkbox v-model="selectStore.blackRandomFourStrong">随机四子</el-checkbox>
                        </div>
                        <div class="qx-calc-depth" v-if="selectStore.blackRole === 'qixian'">
                            <span>棋仙计算深度：</span>
                            <el-input class="qx-depth-input" v-model="selectStore.blackQxDepth"></el-input>
                        </div>
                    </div>
                    <div class="option-intro">
                        <span v-if="selectStore.blackRole === 'user'">玩家手动执黑子</span>
                        <span v-else>由 AI ({{ dictStore.getRole( selectStore.blackRole ).name }}) 执黑子</span>
                    </div>
                </div>
            </el-form-item>

            <el-form-item label="白子角色：" class="option-item right-to-left-2">
                <div class="right-to-left-4">
                    <el-radio-group v-model="selectStore.whiteRole">
                        <template v-for="item in dictStore.roleList">
                            <el-radio-button :label="item.name" :value="item.id" />
                        </template>
                    </el-radio-group>
                    <div class="chess-role-strong">
                        <div class="ss-checkbox-box">
                            <el-checkbox v-model="selectStore.whiteOneHornStrong">占一角</el-checkbox>
                            <el-checkbox v-model="selectStore.whiteHornStrong">占四角</el-checkbox>
                            <el-checkbox v-model="selectStore.whiteEdgeStrong">占四边</el-checkbox>
                            <el-checkbox v-model="selectStore.whiteRandomFourStrong">随机四子</el-checkbox>
                        </div>
                        <div class="qx-calc-depth" v-if="selectStore.whiteRole === 'qixian'">
                            <span>棋仙计算深度：</span>
                            <el-input class="qx-depth-input" v-model="selectStore.whiteQxDepth"></el-input>
                        </div>
                    </div>
                    <div class="option-intro">
                        <span v-if="selectStore.whiteRole === 'user'">玩家手动执白子</span>
                        <span v-else>由 AI ({{ dictStore.getRole( selectStore.whiteRole ).name }}) 执白子</span>
                    </div>
                </div>
            </el-form-item>

            <el-form-item label="棋盘大小：" class="option-item right-to-left-3" style="margin-bottom: 50px;">
                <div class="xy-count-input-box right-to-left-5">
                    <el-input class="xy-count-input" v-model="selectStore.xCount"
                              type="number" @blur="checkXCountYCount"></el-input>
                    <span class="xy-count-x"> x </span>
                    <el-input class="xy-count-input" v-model="selectStore.yCount"
                              type="number" @blur="checkXCountYCount"></el-input>
                </div>
                <el-slider class="xy-count-slider right-to-left-6" v-model="selectStore.xyCount"
                           :min="dictStore.boardMinLength" :max="dictStore.boardMaxLength"
                           show-tooltip :step="1"
                           :format-tooltip="value => value + ' x ' + value"
                           :marks="dictStore.boardLengthMarks" />
            </el-form-item>

            <el-form-item label="我的名字：" class="option-item option-item-username right-to-left-4">
                <el-input class="right-to-left-6" v-model="selectStore.username" style="width: 300px;">
                    <template #append>
                        <el-button icon="el-icon-Refresh" class="random-player-name" @click="selectStore.username = randomUsername()" > 随机一个 </el-button>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item label="辅助选项：" class="option-item right-to-left-5">
                <div class="right-to-left-7">
                    <div class="ss-checkbox-box">
                        <el-checkbox v-model="selectStore.tipsDown">提示落子位置</el-checkbox>
                        <!--                        <el-checkbox v-model="selectStore.tipsDownTranCount">提示落子可回收棋子数量</el-checkbox>-->
                        <!--                        <el-checkbox v-model="selectStore.tipsDownScore">提示落子得分</el-checkbox>-->
                        <el-checkbox v-model="selectStore.showChessPoint">显示棋子坐标</el-checkbox>
                    </div>
                    <div class="qx-calc-depth">
                        <span>AI 提示计算深度：</span>
                        <el-input class="qx-depth-input" v-model="selectStore.helpQxDepth"></el-input>
                    </div>
                    <p class="option-intro">新手按需勾选，老手不建议勾选，会降低自身棋力水平</p>
                </div>
            </el-form-item>

            <el-form-item label="调试选项：" class="option-item right-to-left-6">
                <div class="right-to-left-8">
                    <el-checkbox v-model="selectStore.allowCoverDown">允许覆盖落子</el-checkbox>
                    <el-checkbox v-model="selectStore.allowForceDown">允许强制落子</el-checkbox>
                    <p class="option-intro">此为开发调试选项，如无必要请勿勾选，会破坏游戏规则</p>
                </div>
            </el-form-item>
        </div>
    </div>
</template>

<script setup name="com-select">
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {useGameStore} from "../../../store/game";
import {randomUsername} from "../../../algo/random-username";
const selectStore = useSelectStore();
const dictStore = useDictStore();
const gameStore = useGameStore();


const props = defineProps({
    // 打开方式，page=页面处打开，drawer=抽屉打开 
    mode: {
        type: String
    }
})


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
.con-box{
    
}

.con-title{ margin-bottom: 40px; color: #000; }

// 配置项 
.option-item{

    :deep(.el-form-item__label){
        color: #333;
        font-weight: bold;
        font-size: 16px;
    }
    .option-intro{
        color: #888;
        margin-bottom: 10px;
    }
    // 角色加强
    .chess-role-strong{ padding-top: 10px; padding-bottom: 5px;  }
    .ss-checkbox-box{display: inline-block; margin-right: 20px; }
    .qx-calc-depth{ display: inline-block; vertical-align: top; color: #777 }
    .qx-depth-input{width: 50px;}

    // 棋盘大小控制
    .xy-count-input-box{ width: 120px; }
    .xy-count-input{ width: 45px; }
    .xy-count-x{ display: inline-block; margin: 0 10px; }
    .xy-count-slider{width: calc( 100% - 140px ); margin-left: 20px;}

    // 强改按钮颜色 
    :deep(.el-radio-button,.el-checkbox__label){color: #333;}
}
.option-item-username{ 
    margin-bottom: 40px;
}

.random-player-name{
    padding: 0 10px;
    margin-bottom: 0px !important;
    :deep(.el-icon){
        position: relative;
        top: 2px;
    }
}


</style>
