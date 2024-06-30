<!-- 预定广告位展示位 -->
<template>
    <div class="con-box">
        12323
    </div>
</template>

<script setup name="com-ad-box">
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {useGameStore} from "../../../store/game";
let selectStore = useSelectStore();
var dictStore = useDictStore();
var gameStore = useGameStore();

</script>

<style scoped lang="scss">
    .con-box{
        width: 100%;
        min-height: 100px;
        text-align: center;
        line-height: 100px;
        //background-color: #fff;
        border: 1px solid #666;
    }
    
</style>
