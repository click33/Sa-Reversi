<!-- 鼠标右键弹出的盒子 -->
<template>
    <div class="rt-div" :style="state.boxStyle" v-show="state.boxShow" tabindex="-1" @blur="close2()">
        <div class="rt-div-2">
            <slot name="default" :row="state.nativeObj" :close="close" :close2="close2" v-if="state.nativeObj"></slot>
        </div>
    </div>
</template>

<script setup name="com-right-box">
import {nextTick, reactive} from "vue";

// --------------- 所有状态 ---------------
const state = reactive({
    boxShow: false, // 右键菜单是否正在显示
    boxStyle: {		// 右键菜单的 style 样式
        left: '0px',		// 坐标x
        top: '0px',			// 坐标y
        maxHeight: '0px'	// 右键菜单的最高高度 (控制是否展开)
    },
    nativeObj: null     // 操作的对象  
})

// --------------- 所有方法 ---------------
// 展开右键菜单
const show = function(event, nativeObj) {
    // console.log('-------- 打开右键菜单')
    const e = event || window.event;
    state.boxStyle.left = (e.clientX + 1) + 'px';	// 设置给坐标x
    state.boxStyle.top = e.clientY + 'px';		// 设置给坐标y
    state.nativeObj = nativeObj;
    state.boxShow = true;	// 显示右键菜单
    nextTick(function() {
        const foxHeight = document.querySelector('.rt-div-2').offsetHeight;	// 应该展开多高
        state.boxStyle.maxHeight = foxHeight + 'px';	// 展开
        document.querySelector('.rt-div').focus();		// 获得焦点,以被捕获失去焦点事件
    });
};

// 关闭右键菜单 - 立即关闭
const close = function() {
    state.boxStyle.maxHeight = '0px';
    state.boxShow = false;
};

// 关闭右键菜单 - 带动画折叠关闭 (失去焦点和点击取消时调用, 为什么不全部调用这个? 因为其它时候调用这个都太卡了)
const close2 = function() {
    state.boxStyle.maxHeight = '0px';
    // this.rightShow = false;
};

// 所有开放属性、方法
defineExpose({show});

</script>

<style scoped lang="scss">
	
	/* 右键菜单 样式 */
	.rt-div {
		position: fixed;
		z-index: 2147483647;
		transition: max-height 0.2s;
		outline:none;
		max-height: 0px;
		overflow: hidden;
		box-shadow: 1px 1px 2px #000;
	}
	.rt-div-2{font-size: 0.8em; padding: 0.5em 0; border: 1px #aaa solid; border-radius: 1px; background-color: #FFF;}
	.rt-div-2 {
        :deep(li) {line-height: 2.2em; padding-left: 0.8em; padding-right: 1.4em; cursor: pointer; white-space: nowrap; list-style-type: none;}
        :deep(li):hover {background-color: #ddd;color: #2D8CF0;}
        :deep(li) i{margin-left: 3px; margin-right: 5px; transform: translate(0, 1px)}
    }
</style>
