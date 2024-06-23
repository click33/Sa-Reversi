<!-- 全局消息框 -->
<template>
    <div class="con-box">
       <div v-if="state.isShow">
           <p class="message-p fade-in-ys" :class=" 'message-p-' +  state.type"> {{ state.message }} </p>
       </div>
    </div>
</template>

<script setup name="com-ai-info">
import {reactive} from "vue";
import mitt from "/@/mitt";
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {useGameStore} from "../../../store/game";
let selectStore = useSelectStore();
var dictStore = useDictStore();
var gameStore = useGameStore();

// 消息索引 
let messageIndex = 0;

// ------------------ 数据 ------------------
const state = reactive({
    isShow: true, 
    type: 'info',  // 消息类型，info 提示信息，error 错误信息，success 成功信息
    message: "游戏中", // 消息正文 
})


// ------------------ 方法 ------------------
const showMessage = (type, message) => {
    state.isShow = false;
    nextTick(() => {
        state.type = type;
        state.message = message;
        state.isShow = true;
    })
}

// 订阅 sendMessage 事件
mitt.off('sendMessage');
mitt.on('sendMessage', ({type, message, isLongTime}) => {
    showMessage(type, message);
    // 5秒后自动清除消息
    messageIndex++;
    const index = messageIndex;
    setTimeout(() => {
        if(index === messageIndex && isLongTime !== true) {
            showMessage('info', '游戏中');
        }
    }, 5000);
});

</script>

<style scoped lang="scss">
.con-box{
    width: 100%;
    background-color: #fff;
    text-align: center;
    border-top: 1px solid #ccc;
}

.message-p{ font-weight: 700; }
.message-p-info{ color: #444; }
.message-p-error{ color: red; }
.message-p-success{ color: green; }
.message-p-warning{ color: #E6A23C; }

</style>
