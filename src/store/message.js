import { defineStore } from 'pinia';
import mitt from "/@/mitt";

/**
 * 消息面板数据 
 */
export const useMessageStore = defineStore({
    id: 'message',
    state: () => {
        return {
            index: 0,
            messageList: [
                // {
                //     index: 1,   // 消息索引
                //     role: '黑子',   // 发送人
                //     type: 'info', // 消息类型：info、warning、error、success
                //     text: `落子(A, 1)，回收棋子3枚`, // 消息正文 
                // }
            ],
            messageBufferList: [],  // 消息缓冲区列表，存放尚未打印出来的消息 
        }
    },
    actions: {
        // 发送一条消息 
        sendMessage(role, type, text) {
            this.index++;
            const index = this.index;
            const messageObject = { index, role, type, text };
            
            this.messageList.push(messageObject);
            this.messageBufferList.push(messageObject);

            mitt.emit('startPrintMessage');
        },
    }
})
