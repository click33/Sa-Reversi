<!-- 手拿棋子 -->
<template>
    <div>
        <div class="finger-box" :class=" [('finger-type-' + state.type), ('finger-camp-' + prop.camp)] " :style="state.boxStyle">
            <div class="finger-chess" :style="state.chessStyle" v-if="state.isHold"></div>
            <div class="finger-img-box" :style="state.imgBoxStyle">
                <img class="finger-img" :style="state.imgStyle" src="../../../assets/finger.svg" alt="">
            </div>
        </div>
    </div>
</template>

<script setup name="enemy-finger">
import { onMounted, reactive } from "vue";
import { useGameStore } from "../../../store/game";
let gameStore = useGameStore();

// 组件形参 
const prop = defineProps({
    camp: { type: String, default: 'we' }  // 立场，we / enemy
})

// ------------------ 数据 ------------------
const state = reactive({
    type: 'black',  // 棋子类型，black / white 
    animType: 'direct', // 小手动画类型 direct=正常，一步到位，yx=先y轴后x轴，mix=混合，think=思考，fast=快速
    isHold: false,  // 此时此刻是否正在手持棋子 
    // 总盒子样式
    boxStyle: {
        left: '50vw', // 大盒子x轴坐标
        top: prop.camp === 'we' ? '100vh' : '0vh', //  // 大盒子y轴坐标
        transitionDuration: '500ms'  // 动画时长
    },
    // 棋子样式 
    chessStyle: {
        width: '55px',
        height: '55px',
    },
    // 小手样式
    imgBoxStyle: {
        width: '100px',
        height: '100px',
        // transform: 'translate(0px,0px)',
    }
})


// ------------------ 方法 ------------------

// 在指定位置放置棋子
const down = (x, y, moveSuccessCallback) => {
    let chessDOM = document.querySelector(`.chess-${x}-${y}`);
    // chessDOM = document.querySelector(`.finger-box`);
    
    // 手持棋子
    state.isHold = true;
    
    // 设定棋子类型
    state.type = gameStore.currentPlayerType;
    
    // 设定棋子宽高 
    const chessWidth = chessDOM.clientWidth;
    const chessHeight = chessDOM.clientHeight;
    state.chessStyle.width = `${chessWidth}px`;
    state.chessStyle.height = `${chessHeight}px`;

    // 设定小手宽高 
    state.imgBoxStyle.width = `${chessWidth * 2}px`;
    state.imgBoxStyle.height = `${chessHeight * 2}px`;
    
    // 设定小手偏移距离
    // 已在 css 中设定，此处无需设置
    
    nextTick(() => {
        // 调整整体坐标 
        const rectTop = chessDOM.getBoundingClientRect().top;
        const rectLeft = chessDOM.getBoundingClientRect().left;
        
        // 计算最终坐标 
        let moveTop = 0;
        let moveLeft = 0;
        if(prop.camp === 'we') {
            moveTop = rectTop;
            moveLeft = rectLeft;
        }
        if(prop.camp === 'enemy') {
            moveTop = rectTop + chessWidth;
            moveLeft = rectLeft + chessHeight;
        }
        
        // 开始移动 
        moveFingerToTd(prop.camp, moveTop, moveLeft, function (){
            // 棋子放置成功，调用回调函数 
            if(moveSuccessCallback) {
                moveSuccessCallback();
            }

            // 100ms 后，将小手移出视野 
            setTimeout(() => {
                state.isHold = false;
                if(prop.camp === 'we') {
                    state.boxStyle.top = `100vh`;
                }
                if(prop.camp === 'enemy') {
                    state.boxStyle.top = `0vh`;
                }
            }, 100);
        });
    });
    
    // console.log(chessDOM.getBoundingClientRect().top, chessDOM.getBoundingClientRect().left);
}

// 移动小手到棋盘格子上 
const moveFingerToTd = (camp, top, left, callback) => {
    // 动画类型 direct=正常，一步到位，yx=先y轴后x轴，mix=混合，think=思考，fast=快速，shake=晃来晃去，slow=慢速，throw=甩几下 
    const animArray = ['direct', 'yx', 'mix', 'think', 'fast', 'shake', 'slow', 'throw'];
    const animArray2 = ['shake', 'slow', 'throw'];
    let animType = animArray[Math.floor(Math.random() * animArray.length)];
    // 如果本次和上一次都属于慢速里的几个，则指定为 direct，避免节奏太慢 
    if(animArray2.includes(animType) && animArray2.includes(state.animType)) {
        animType = 'direct';
    }
    state.animType = animType;
    // state.animType = 'shake';
    
    // 正常，一步到位
    if(state.animType === 'direct') {
        state.boxStyle.transitionDuration = '600ms';
        state.boxStyle.top = `${top}px`;
        state.boxStyle.left = `${left}px`;
        setTimeout(callback, 600);
    }
    
    // 先y轴后x轴
    if(state.animType === 'yx') {
        state.boxStyle.transitionDuration = '400ms';
        state.boxStyle.top = `${top}px`;
        setTimeout(() => {
            state.boxStyle.left = `${left}px`;
            setTimeout(callback, 400);
        }, 400);
    }

    // 混合
    if(state.animType === 'mix') {
        state.boxStyle.transitionDuration = '600ms';
        state.boxStyle.top = `${top}px`;
        setTimeout(() => {
            state.boxStyle.transitionDuration = '300ms';
            state.boxStyle.left = `${left}px`;
            setTimeout(callback, 300);
        }, 300);
    }

    // 思考 
    if(state.animType === 'think') {
        state.boxStyle.transitionDuration = '400ms';
        if(camp === 'we') {
            state.boxStyle.top = `${sa.randomNum(90, 70)}vh`;
        }
        if(camp === 'enemy') {
            state.boxStyle.top = `${sa.randomNum(10, 30)}vh`;
        }
        setTimeout(() => {
            state.boxStyle.transitionDuration = '400ms';
            state.boxStyle.top = `${top}px`;
            state.boxStyle.left = `${left}px`;
            setTimeout(callback, 400);
        }, 800);
    }
    
    // 快速
    if(state.animType === 'fast') {
        state.boxStyle.transitionDuration = '200ms';
        state.boxStyle.top = `${top}px`;
        state.boxStyle.left = `${left}px`;
        setTimeout(callback, 200);
    }
    
    // 晃来晃去 
    if(state.animType === 'shake') {
        state.boxStyle.transitionDuration = '400ms';
        state.boxStyle.top = `calc(${top}px + ${sa.randomNum(-10, 10)}vh)`;
        // state.boxStyle.left = `calc(${left}px + ${sa.randomNum(-20, 20)}vw)`;
        setTimeout(() => {
            state.boxStyle.transitionDuration = '100ms';
            state.boxStyle.top = `calc(${top}px + ${sa.randomNum(-5, 5)}vh)`;
            state.boxStyle.left = `calc(${left}px + ${sa.randomNum(-10, 10)}vw)`;
            setTimeout(() => {
                state.boxStyle.top = `calc(${top}px + ${sa.randomNum(-5, 5)}vh)`;
                state.boxStyle.left = `calc(${left}px + ${sa.randomNum(-10, 10)}vw)`;
                setTimeout(() => {
                    state.boxStyle.transitionDuration = '400ms';
                    state.boxStyle.top = `${top}px`;
                    state.boxStyle.left = `${left}px`;
                    setTimeout(callback, 400);
                }, 100);
            }, 100);
        }, 800);
    }

    // 慢，犹豫不决 
    if(state.animType === 'slow') {
        // state.boxStyle.transitionDuration = '400ms';
        state.boxStyle.transitionDuration = '300ms';
        slowIterator(top, left, () => {
            setTimeout(() => {
                state.boxStyle.transitionDuration = '200ms';
                state.boxStyle.top = `${top}px`;
                state.boxStyle.left = `${left}px`;
                setTimeout(callback, 200);
            }, 800)
        }, 3)
    }

    // 甩几下 
    if(state.animType === 'throw') {
        const zjTop = `calc(${top}px + ${sa.randomNum(-10, 10)}vh)`;
        const zjLeft = state.boxStyle.left;
        
        // 向右上甩几下 
        const driftTop = sa.randomNum(-10, 10);
        const driftLeft= sa.randomNum(-10, 10);

        const shuaiTop = `calc(${zjTop} - ${driftTop}vh)`;
        const shuaiLeft = `calc(${zjLeft} - ${driftLeft}vw)`;

        const shuaiTop2 = `calc(${zjTop} + ${driftTop}vh)`;
        const shuaiLeft2 = `calc(${zjLeft} + ${driftLeft}vw)`;
        
        // 先走到附近 
        state.boxStyle.transitionDuration = '400ms';
        state.boxStyle.top = zjTop;
        state.boxStyle.left = zjLeft;

        // 开始甩 
        setTimeout(()=>{
            state.boxStyle.transitionDuration = '100ms';
            throwIterator(shuaiTop, shuaiLeft, shuaiTop2, shuaiLeft2, () => {
                // 甩完了，开始正式落子 
                setTimeout(() => {
                    state.boxStyle.transitionDuration = '200ms';
                    state.boxStyle.top = `${top}px`;
                    state.boxStyle.left = `${left}px`;
                    setTimeout(callback, 200);
                }, 100)
            }, 3)
        }, 600);
    }
    
    
}

// slow 动画，迭代器
const slowIterator  = (top, left, callback, freq) => {
    freq--;
    if(freq < 0) {
        return callback();
    }
    state.boxStyle.top = `calc(${top}px + ${sa.randomNum(-10, 10)}vh)`;
    state.boxStyle.left = `calc(${left}px + ${sa.randomNum(-10, 10)}vw)`;
    setTimeout(() => {
        slowIterator(top, left, callback, freq);
    }, 1000);
}

// throw 函数，迭代器
const throwIterator  = (top, left, top2, left2, callback, freq) => {
    freq--;
    if(freq < 0) {
        return callback();
    }
    
    // 
    state.boxStyle.top = top;
    state.boxStyle.left = left;
    setTimeout(()=>{
        state.boxStyle.top = top2;
        state.boxStyle.left = left2;
        setTimeout(() => {
            throwIterator(top, left, top2, left2, callback, freq);
        }, 100);
    }, 100);
}


defineExpose({
    down
})

// 组件加载时触发
onMounted(() => { 
    // setTimeout(() => {
    //     state.boxStyle.left = '800px';
    // } , 1000);
})

</script>

<style scoped lang="scss">
.finger-box{
    position: fixed;
    //width: 10px;
    //height: 10px;
    //transition: all 0.5s;
    transition-property: all;
    transition-timing-function: ease-out;
    //transition-duration: 0.5s;
    z-index: 10000;
}
.finger-chess{
    position: absolute;
    border-radius: 50%;
}
.finger-img-box{ position: absolute; transform: translate(-18%, 3%);}
.finger-img{transform: rotateX(180deg); width: 100%; height: 100%;}

// 白子样式 
.finger-type-white { .finger-chess{ background-color: #FFF; box-shadow: 0 0 20px #000; } }
// 黑子样式 
.finger-type-black { .finger-chess{ background-color: #000; box-shadow: 0 0 25px yellow; } }

// we阵营样式 
.finger-camp-we {  }
// enemy阵营样式 
.finger-camp-enemy { transform: rotate(180deg); }


</style>
