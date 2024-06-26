<!-- 全局消息框 -->
<template>
    <el-card class="con-box zdy-card" header="日志信息">
        <el-scrollbar class="message-box" ref="message-scrollbar" always>
            <div class="message-box-2" ref="message-box-2">
               <div v-for="item in state.messageList" 
                   class="message-item" :class=" 'msg-index-length-' + item.index.toString().length ">
                   <div class="message-role">{{ item.index }}. {{ item.role }}：</div>
                   <p class="message-p" :class=" 'message-p-' +  item.type">
                       <span>{{ item.text }}</span>
                       <span class="gb-cursor" v-if="item.index === state.index ">&nbsp;</span>
                   </p>
                   <div style="clear: both;"></div>
               </div>
            </div>
        </el-scrollbar>
    </el-card>
</template>

<script setup name="com-message-box">
import {reactive} from "vue";
import mitt from "/@/mitt";
import {useGameStore} from "../../../store/game";
import {useMessageStore} from "../../../store/message";
const { proxy } = getCurrentInstance();
var gameStore = useGameStore();
const messageStore = useMessageStore();


// ------------------ 数据 ------------------
const state = reactive({
    isPrinting: false,  // 此时此刻是否正在打印消息 
    index: 0,  // 消息索引 
    messageList: [],  // 真正已经展现出来的消息列表
});

// ------------------ 方法 ------------------

// 判断：如果消息缓冲区不为空，就开始打印消息 
const printAMessageByBufferNotEmpty = function(){
    if(messageStore.messageBufferList.length > 0) {
        state.isPrinting = true;
        printAMessage(messageCopy => {
            printAMessageByBufferNotEmpty();
        });
    } else {
        state.isPrinting = false;
    }
};

// 从消息缓冲区中取出一条消息，打印出来 
const printAMessage = (callback) => {
    
    // 拷贝副本，不操作原数据 
    const message = messageStore.messageBufferList.shift();
    const messageCopy = JSON.parse(JSON.stringify(message));

    // 推送到消息列表 
    const text = messageCopy.text;
    messageCopy.text = '';
    state.messageList.push(messageCopy);
    state.index = messageCopy.index;

    // 先把滚动条设置到最底部，让用户能看到打印的内容 
    setScrollToBottom();

    // 开始给正文一点点赋值 
    const messageIndex = state.messageList.length - 1; 
    slowlyGive(state.messageList, messageIndex, text, 0, text.length, () => {
        callback(messageCopy);
    });
}

// 一个字一个字的给消息正文赋值 
const slowlyGive = function (messageList, messageIndex, text, textIndex, textLength, callback){
    
    setTimeout(() => {

        // 给字
        messageList[messageIndex].text += text[textIndex];
        textIndex++;

        // 如果已经给完了，就结束 
        if(textIndex === textLength) {
            return callback();
        }
        
        // 如果 text 过长，可能造成打印半天都打到面板外面去了，所以此处每20个字符就设置一下滚动条，让用户能看到打印的内容
        if(textIndex > 0 && textIndex % 20 === 0) {
            setScrollToBottom();
        }

        // 否则，继续给 
        slowlyGive(messageList, messageIndex, text, textIndex, textLength, callback);
    }, 30);
}

// 订阅 startPrintMessage 事件，当有新消息时，及时开始打印 
mitt.off('startPrintMessage');
mitt.on('startPrintMessage', () => {
    // 如果正在打印了，就不去判断了 
    if(state.isPrinting) {
        // console.log('正在打印呢，你等会...');
        return;
    }
    printAMessageByBufferNotEmpty();
});


// 滚动条滚动到最底部 
const setScrollToBottom = function(){
    // 把滚动条高度设置到最后一个消息的位置 
    nextTick(() => {
        setScroll(proxy.$refs['message-box-2'].clientHeight);
    })
}

// 设置滚动条 带动画效果，value=要滚动到的位置
const setScroll = function (value){
    const start = getWrap().scrollTop; // 初始值
    const end = value;   // 结束值
    let ci = 20;    // 分多少次完成
    const bu = (end - start) / ci;  // 每次跳跃多少

    // 递归函数
    const fn = function (){
        getWrap().scrollTop += bu;
        ci--;
        if(ci >= 0) {
            setTimeout(fn, 10);
        }
    }
    fn();
}

// 获取滚动条操作对象
const getWrap = function () {
    return proxy.$refs['message-scrollbar'].$refs.wrapRef;
}


</script>

<style scoped lang="scss">
.con-box{
    width: 100%;
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 0px 0px 5px #ddd;
    //background-color: #fff;
    
    :deep(.el-card__header) {padding-left: 14px;}
    :deep(.el-card__body) {padding: 0;}
}
.message-box{padding: 14px 0px; height: 200px; cursor: text;}
.message-box-2{ padding: 0px 12px 10px 12px; }


// 一条消息 
.message-item{ overflow: hidden; margin-bottom: 6px; line-height: 20px; font-size: 12px;}
.message-role{
    width: var(--msg-role-width);
    float: left;
    font-weight: 700;
    text-align: right;
    color: #333;
}
.message-p{
    width: calc(100% - var(--msg-role-width));
    float: left;
}
// 不同 index 长度，需要占用不同的宽度 
.message-item{ --msg-role-width: 4.4em;}
.msg-index-length-1{--msg-role-width: 4.4em;}
.msg-index-length-2{--msg-role-width: 4.8em;}
.msg-index-length-3{--msg-role-width: 5.3em;}
.msg-index-length-4{--msg-role-width: 5.9em;}
.msg-index-length-5{--msg-role-width: 6.5em;}
.msg-index-length-6{--msg-role-width: 7.1em;}

// 不同消息类型，需要不同的颜色
.message-p{display: inline-block;  }
.message-p-info{ color: #888; .gb-cursor{background-color: #888;} }
.message-p-error{ color: red; .gb-cursor{background-color: red;} }
.message-p-success{ color: green; .gb-cursor{background-color: green;} }
.message-p-warning{ color: #E6A23C; .gb-cursor{background-color: #E6A23C;} }

// 闪烁的光标
.gb-cursor {display: inline-block; width: 1.5px; height: 13px; position: relative; top: 4px; left: 3px; background-color: #666; animation: blink 0.4s infinite alternate;}
@keyframes blink { from {opacity: 0;} to {opacity: 1;} }


</style>
