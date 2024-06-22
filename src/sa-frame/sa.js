/* eslint-disable */
import router from '/@/router'
import {layer} from "@layui/layer-vue";
// import * as XLSX from 'xlsx';
import {useAppStore} from "../store/app";
import {nextTick} from "vue";
import mitt from "@/mitt";

// =========================== sa对象封装一系列工具方法 ===========================
var sa = {
    updateTime: '2024-5-18',
    info: '将 layer 的依赖更改为 layer-vue，彻底删除 jQuery 依赖'
};
window.sa = sa;

// ===========================  当前环境配置  =======================================
(function(){
    // 开发环境
    var cfg_dev = {
        api_url: import.meta.env.VITE_SERVER_URL,	// 所有ajax请求接口父地址
        // api_url: process.env.VUE_APP_BASE_API	// 所有ajax请求接口父地址
    }
    // 测试环境
    // var cfg_test = {
    //     api_url: 'http://demo-jj.dev33.cn/spdj-server',
    // }
    // // 生产环境
    // var cfg_prod = {
    //     api_url: 'http://www.baidu.com',
    // }
    sa.cfg = cfg_dev; // 最终环境 , 上线前请选择正确的环境
})();


// ===========================  ajax的封装  =======================================
(function(){

    // 模拟 ajax 请求   --- 此请求并不会向后台发送请求，只会模拟显示一个 loading 图标 
    sa.ajax2 = function(url, data, success200, cfg){
        // 如果是简写模式(省略了data参数)
        if(typeof data === 'function'){
            cfg = success200;
            success200 = data;
            data = {};
        }
        // 几个默认配置
        cfg = cfg || {};
        cfg.baseUrl = (url.indexOf('http') === 0 ? '' : sa.cfg.api_url);	// 父url，拼接在url前面
        // 设定一个默认的提示文字
        if(cfg.msg === undefined || cfg.msg === null || cfg.msg === '') {
            cfg.msg = '正在努力加载...';
        }
        // 默认延时函数
        if(cfg.sleep === undefined || cfg.sleep === null || cfg.sleep === '' || cfg.sleep === 0) {
            cfg.sleep = 600;
        }
        // 默认的模拟数据
        cfg.res = cfg.res || {
            code: 200,
            msg: 'ok',
            data: []
        }
        // 开始loding
        sa.loading(cfg.msg);

        // 打印请求地址和参数, 以便调试
        console.log("---------------------------- 模拟ajax ------------------------------");
        console.log("请求：", cfg.baseUrl + url, '', JSON.stringify(data));

        // 模拟ajax的延时
        setTimeout(function() {
            sa.hideLoading();	// 隐藏掉转圈圈
            console.log('返回：', cfg.res);
            success200(cfg.res);
        }, cfg.sleep)
    };

})();


// ===========================  封装弹窗相关函数   =======================================
(function() {

    var me = sa;
    if(layer) {
        sa.layer = layer;
        // layer.ready(function(){});
    }

    // tips提示文字
    me.msg = function(msg, cfg) {
        msg = msg || '操作成功';
        cfg = cfg || {};
        cfg.time = 3000;
        layer.msg(msg, cfg);
    };

    // 操作成功的提示：对号表情
    me.ok = function(msg = '操作成功') {
        me.msg(msg, {anim: 0, icon: 1, time: 2000 });
    }
    // 操作成功的提示：笑脸表情
    me.ok2 = function(msg = '操作成功') {
        me.msg(msg, {anim: 0, icon: 6, time: 2000 });
    }

    // 操作失败的提示：叉号表情
    me.error = function(msg = "操作失败") {
        me.msg(msg, {icon: 2 });
    }
    // 操作失败的提示：哭脸表情
    me.error2 = function(msg="操作失败") {
        me.msg(msg, {icon: 5 });
    }

    // alert弹窗 [text=提示文字, okFn=点击确定之后的回调函数]
    me.alert = function(text, config, okFn) {
        // 如果 config 填写的是一个函数，则代表填写的是 okFn 
        if(typeof config === 'function') {
            okFn = config;
        }
        config = config || {};
        config.title = config.title || '提示';
        config.btn = [
            {
                text:'确定', 
                callback: function (id){
                    layer.close(id);
                    if(okFn) {
                        okFn();
                    }
                }
            }
        ];
        
        // 开始弹窗
        layer.confirm(text, config);
    };

    // alert弹窗成功信息
    me.alertSuccess = function(text, okFn) {
        return me.alert(text, {icon: 1}, okFn);
    };
    me.alertOk = me.alertSuccess;

        // alert弹窗异常信息 
    me.alertError = function(text, okFn) {
        return me.alert(text, {icon: 2}, okFn);
    };

    // alert弹窗警告信息 
    me.alertWarn = function(text, okFn) {
        return me.alert(text, {icon: 7}, okFn);
    };

    // alert html 信息 
    me.alertHtml = function(text, config, okFn) {
        config = config || {};
        config.isHtmlFragment = true;
        return me.alert(text, config, okFn);
    };

    // 询问框 [text=提示文字, okFn=点击确定之后的回调函数]
    me.confirm = function(text, config, okFn) {
        // 如果第二个参数填写的是一个函数，则代表填写的是 okFn 
        if(typeof config === 'function') {
            okFn = config;
            config = {};
        }
        config = config || {};
        config.title = config.title || '提示';
        config.icon = config.icon || 3;
        config.btn = [
            {
                text:'确定',
                callback: function (id){
                    layer.close(id);
                    if(okFn) {
                        okFn();
                    }
                }
            },
            {
                text:'取消',
                callback: function (id){
                    layer.close(id);
                }
            }
        ];
        
        layer.confirm(text, config);
    };

    // 询问框 [text=提示文字, okFn=点击确定之后的回调函数]
    me.confirmWarn = function(text, okFn) {
        return me.confirm(text, {icon: 7}, okFn);
    };

    // 输入框 [title=提示文字, okFn=点击确定后的回调函数, formType=输入框类型(0=文本,1=密码,2=多行文本域) 可省略, value=默认值 可省略 ]
    me.prompt = function(title, okFn, formType = 0, value, cfg={}) {
        let inputDom = ''
        if(formType === 0) {
            inputDom = '<input type="text" class="sa-layer-prompt" />';
        }
        if(formType === 1) {
            inputDom = '<input type="password" class="sa-layer-prompt" autocomplete="off" />';
        }
        if(formType === 2) {
            inputDom = '<textarea class="sa-layer-prompt"></textarea>';
            // 如果指定了 width 参数，则需要强制指定其 width
            if(cfg.width) {
                inputDom = '<textarea class="sa-layer-prompt" style="width: ' + cfg.width + 'px; height: ' + cfg.height + 'px;"></textarea>';
            }
        }

        layer.confirm("", {
            type: 1,
            title: title,
            shadeClose: cfg.shadeClose === undefined ? false: cfg.shadeClose,
            isHtmlFragment: true,
            content: "<div class='sa-layer-prompt-box'>" +
                '<form onsubmit="return false" > ' +
                inputDom +
                "</form>" +
                "</div>",
            btn: [
                {
                    text:'确定',
                    callback: function (id){
                        if(okFn) {
                            const value = document.querySelector('.sa-layer-prompt').value;
                            okFn(value, layer, id);
                        } else {
                            layer.close(id);
                        }
                    }
                },
                {
                    text:'取消',
                    callback: function (id){
                        layer.close(id);
                    }
                }
            ],
            success: () => {
                if(value) {
                    document.querySelector('.sa-layer-prompt').value = value;
                }
            }
        });

    }

    // 打开loading, Admin 面板方式
    me.loading = function(msg, msgType) {
        if(msgType === 'layer') {
            return sa.loading2(msg);
        }
        useAppStore().showOsLoading(msg);
    };

    // 隐藏loading, Admin 面板方式
    me.hideLoading = function(msgType) {
        if(msgType === 'layer') {
            return sa.hideLoading2();
        }
        useAppStore().hideOsLoading();
    };

    // 打开loading, layer 方式
    me.loading2 = function(msg = "加载中...") {
        layer.closeAll();	// 开始前先把所有弹窗关了
        return layer.msg(msg, {
            icon: 16,
            shade: true,
            time: 1000 * 200,
            skin: 'ajax-layer-load'
        });
    };

    // 隐藏loading, layer 方式
    me.hideLoading2 = function(index) {
        layer.closeAll(index);
    };

    // ============== 一些常用弹窗 =====================

    // 大窗显示一个图片 
    // 参数: src=地址、w=宽度(默认80%)、h=高度(默认80%)
    me.showImage = function(src, w, h) {
        me.showImageList([src])
    }

    // 预览一组图片  
    // srcList=图片路径数组(可以是json样，也可以是逗号切割式), index=打开立即显示哪张(可填下标, 也可填写src路径)
    me.showImageList = function(srcList, index) {
        // 如果填的是个string
        srcList = srcList || [];
        if(typeof srcList === 'string') {
            try{
                srcList = JSON.parse(srcList);
            }catch(e){
                try{
                    srcList = srcList.split(',');	// 尝试字符串切割
                }catch(e){
                    srcList = [];
                }
            }
        }
        
        // 如果 srcList 是如下格式： [{value: 'xxx', value: 'xxx'}]
        if(srcList.length > 0 && typeof srcList[0] !== 'string' ) {
            const newSrcList = [];
            for (const item of srcList) {
                newSrcList.push(item.value)
            }
            srcList = newSrcList;
        }
        console.log('srcList', srcList)
        console.log('index', index)
        console.log(srcList.indexOf(index))
        // 如果填的是路径
        index = index || 0;
        if(typeof index === 'string') {
            index = srcList.indexOf(index);
            index = (index === -1 ? 0 : index);
        }

        // 开始展示
        mitt.emit('showImageList', { srcList, index });
    }

    // 显示行为验证窗口，success 为验证成功后的回调 
    me.showCaptchaModel = function(success) {
        mitt.emit('showCaptchaModel', { success });
    }

    // 显示一个iframe  -- [ vue3下不可用 ]
    // 参数: 标题，地址，宽，高 , 点击遮罩是否关闭, 默认false
    me.showIframe = function(title, url, w, h, shadeClose) {
        // 参数修正
        w = w || '95%';
        h = h || '95%';
        shadeClose = (shadeClose === undefined ? false : shadeClose);
        // 弹出面板
        var index = layer.open({
            type: 2,
            title: title,	// 标题
            shadeClose: shadeClose,	// 是否点击遮罩关闭
            maxmin: true, // 显示最大化按钮
            shade: 0.8,		// 遮罩透明度
            scrollbar: false,	// 屏蔽掉外层的滚动条
            moveOut: true,		// 是否可拖动到外面
            area: [w, h],	// 大小
            content: url,	// 传值
            // 解决拉伸或者最大化的时候，iframe高度不能自适应的问题
            resizing: function(layero) {
                solveLayerBug(index);
            }
        });
        // 解决拉伸或者最大化的时候，iframe高度不能自适应的问题
        $('#layui-layer' + index + ' .layui-layer-max').click(function() {
            setTimeout(function() {
                solveLayerBug(index);
            }, 200)
        })
    }

    // 显示一个iframe, 底部按钮方式  -- [ vue3下不可用 ]
    // 参数: 标题，地址，点击确定按钮执行的代码(在子窗口执行)，宽，高
    me.showIframe2 = function(title, url, evalStr, w, h) {
        // 参数修正
        w = w || '95%';
        h = h || '95%';
        // 弹出面板
        var index = layer.open({
            type: 2,
            title: title,	// 标题
            closeBtn: (title ? 1 : 0),	// 是否显示关闭按钮
            btn: ['确定', '取消'],
            shadeClose: false,	// 是否点击遮罩关闭
            maxmin: true, // 显示最大化按钮
            shade: 0.8,		// 遮罩透明度
            scrollbar: false,	// 屏蔽掉外层的滚动条
            moveOut: true,		// 是否可拖动到外面
            area: [w, h],	// 大小
            content: url,	// 传值
            // 解决拉伸或者最大化的时候，iframe高度不能自适应的问题
            resizing: function(layero) {

            },
            yes: function(index, layero) {
                var iframe = document.getElementById('layui-layer-iframe' + index);
                var iframeWindow = iframe.contentWindow;
                iframeWindow.eval(evalStr);
            }
        });
    }

    // 当前iframe关闭自身  (在iframe中调用)  -- [ vue3下不可用 ]
    me.closeCurrIframe = function() {
        try{
            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
            parent.layer.close(index); //再执行关闭
        }catch(e){
            // handle the exception
        }
    }

    //执行一个函数, 解决layer拉伸或者最大化的时候，iframe高度不能自适应的问题  -- [ vue3下不可用 ]
    function solveLayerBug(index) {
        var selected = '#layui-layer' + index;
        var height = $(selected).height();
        var title_height = $(selected).find('.layui-layer-title').height();
        $(selected).find('iframe').css('height', (height - title_height) + 'px');
    }

    // 监听回车事件，达到回车关闭弹窗的效果  -- [ vue3下不可用 ]
    // if(window.$) {
    //     $(document).on('keydown', function(event) {
    //         if(event.keyCode === 13 && $(".layui-layer-btn0").length === 1 && !window.is_not_watch_enter && $(this).find('.layui-layer-input').length === 0){
    //             $(".layui-layer-btn0").click();
    //             return false;
    //         }
    //     });
    // }

    // 显示全局dialog
    me.showModel = function(title, view, param) {
        mitt.emit('showModel', {title, view, param});
    };

    // 关闭全局dialog
    me.closeModel = function() {
        mitt.emit('closeModel');
    };

    // 创建一个新的 tab view 并显示 
    me.showTempView = function (id, title, component, meta) {
        useAppStore().showTempView(id, title, component, meta);
    }

    // 获取当前路由对应的视图组件
    // me.currView = function() {
    //     return useComStore().currView();
    // }

    // 刷新当前次级视图 
    me.f5CurrView = function() {
        mitt.emit('f5CurrView');
    }

})();


// ===========================  常用util函数封装   =======================================
(function () {

    // 超级对象
    var me = sa;

    // ===========================  常用util函数封装   =======================================
    if(true) {

        // 从url中查询到指定参数值
        me.p = function(name, defaultValue){
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == name){return pair[1];}
            }
            return(defaultValue == undefined ? null : defaultValue);
        }
        me.q = function(name, defaultValue){
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == name){return pair[1];}
            }
            return(defaultValue == undefined ? null : defaultValue);
        }

        // 判断一个变量是否为null
        // 返回true或false，如果return_obj有值，则在true的情况下返回return_obj
        me.isNull = function(obj, return_obj){
            var flag = [null, undefined, '', 'null', 'undefined'].indexOf(obj) !== -1;
            if(return_obj === undefined){
                return flag;
            } else {
                if(flag){
                    return return_obj;
                } else {
                    return obj;
                }
            }
        }

        // 判断一个数组里所有值是否含有null 
        me.hasNull = function(arr, return_obj){
            for (let item of arr) {
                console.log(item)
                if(me.isNull(item)) {
                    return true;
                }
            }
            return false;
        }

        // 将时间戳转化为指定时间
        // way：方式（1=年月日，2=年月日时分秒）默认1,  也可以指定格式：yyyy-MM-dd HH:mm:ss
        me.forDate = function(inputTime, way) {
            if(me.isNull(inputTime) == true){
                return "";
            }
            var date = new Date(inputTime);
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            var h = date.getHours();
            h = h < 10 ? ('0' + h) : h;
            var minute = date.getMinutes();
            var second = date.getSeconds();
            minute = minute < 10 ? ('0' + minute) : minute;
            second = second < 10 ? ('0' + second) : second;
            var ms = date.getMilliseconds();

            way = way || 1;
            // way == 1  年月日
            if(way === 1) {
                return y + '-' + m + '-' + d;
            }
            // way == 1  年月日时分秒
            if(way === 2){
                return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
            }
            // way == 具体格式   标准格式: yyyy-MM-dd HH:mm:ss
            if(typeof way == 'string') {
                return way.replace("yyyy", y).replace("MM", m).replace("dd", d).replace("HH", h).replace("mm", minute).replace("ss", second).replace("ms", ms);
            }
            return y + '-' + m + '-' + d;
        };
        // 时间日期
        me.forDatetime = function(inputTime) {
            return me.forDate(inputTime, 2);
        }

        // 将时间转化为 个性化 如：3小时前,
        // d1 之于 d2 ，d2不填则默认取当前时间
        me.forDate2 = function(d, d2){

            var hou = "前";

            if(d == null || d == '') {
                return '';
            }
            if(d2 == null || d2 == '') {
                d2 = new Date();
            }
            d2 = new Date(d2).getTime();

            var timestamp = new Date(d).getTime() - 1000;
            var mistiming = Math.round((d2 - timestamp) / 1000);
            if(mistiming < 0) {
                mistiming = 0 - mistiming;
                hou = '后'
            }
            var arrr = ['年', '月', '周', '天', '小时', '分钟', '秒'];
            var arrn = [31536000, 2592000, 604800, 86400, 3600, 60, 1];
            for (var i = 0; i < arrn.length; i++) {
                var inm = Math.floor(mistiming / arrn[i]);
                if (inm != 0) {
                    return inm + arrr[i] + hou;
                }
            }
        }

        // 综合以上两种方式，进行格式化
        // 小于24小时的走forDate2，否则forDat
        me.forDate3 = function(d, way) {
            if(d == null || d == '' ) {
                return '';
            }
            var cha = new Date().getTime() - new Date(d).getTime();
            cha = (cha > 0 ? cha : 0 - cha);
            if(cha < (86400 * 1000)) {
                return me.forDate2(d);
            }
            return me.forDate(d, way);
        }

        // 返回时间差, 此格式数组：[x, x, x, 天, 时, 分, 秒]
        me.getSJC = function (small_time, big_time) {
            var date1 = new Date(small_time); //开始时间
            var date2 = new Date(big_time); //结束时间
            var date3 = date2.getTime() - date1.getTime(); //时间差秒
            //计算出相差天数
            var days = Math.floor(date3 / (24 * 3600 * 1000));

            //计算出小时数
            var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
            var hours = Math.floor(leave1 / (3600 * 1000));

            //计算相差分钟数
            var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
            var minutes = Math.floor(leave2 / (60 * 1000));

            //计算相差秒数
            var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
            var seconds = Math.round(leave3 / 1000);

            // 返回数组
            return [0, 0, 0, days, hours, minutes, seconds];
        }

        // 将日期，加上指定天数
        me.dateAdd = function(d, n) {
            var s = new Date(d).getTime();
            s += 86400000 * n;
            return new Date(s);
        }

        // 转化json，出错返回默认值
        me.JSONParse = function(obj, default_obj){
            try{
                return JSON.parse(obj) || default_obj;
            }catch(e){
                return default_obj || {};
            }
        }

        // 截取指定长度字符，默认50
        me.maxLength = function (str, length) {
            length = length || 50;
            if(!str){
                return "";
            }
            return (str.length > length) ? str.substr(0, length) + ' ...' : str;
        },

        // 过滤掉标签
        me.text = function(str){
            if(!str){
                return "";
            }
            return str.replace(/<[^>]+>/g,"");
        }

        // 为指定集合的每一项元素添加上is_update属性
        me.listAU = function(list){
            list.forEach(function(ts){
                ts.is_update  = false;
            })
            return list;
        }

        // 获得一段文字中所有图片的路径
        me.getSrcList = function(str){
            try{
                var imgReg = /<img.*?(?:>|\/>)/gi;	//匹配图片（g表示匹配所有结果i表示区分大小写）
                var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;	//匹配src属性
                var arr = str.match(imgReg);	// 图片数组
                var srcList = [];
                for (var i = 0; i < arr.length; i++) {
                    var src = arr[i].match(srcReg);
                    srcList.push(src[1]);
                }
                return srcList;
            } catch (e){
                return [];
            }
        }

        // 无精度损失的乘法
        me.accMul = function(arg1, arg2) {
            var m = 0,
                s1 = arg1.toString(),
                s2 = arg2.toString(),
                t;

            t = s1.split(".");
            // 判断有没有小数位，避免出错
            if (t[1]) {
                m += t[1].length
            }

            t = s2.split(".");
            if (t[1]) {
                m += t[1].length
            }

            return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
        }

        // 正则验证是否为手机号
        me.isPhone = function(str) {
            str = str + '';
            if((/^1[34578]\d{9}$/.test(str))){
                return true;
            }
            return false;
        }

        // 正则验证是否为邮箱
        me.isEmail = function (email) {
            var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            return emailRegex.test(email);
        }

        // 产生随机字符串
        me.randomString = function(len) {
            len = len || 32;
            var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
            var maxPos = $chars.length;
            var str = '';
            for (let i = 0; i < len; i++) {
                str += $chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return str;
        }

        // 刷新页面
        me.f5 = function() {
            location.reload();
        }

        // 动态加载js
        me.loadJS = function(src, onload) {
            var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.src = src;
            script.onload = onload;
            document.body.appendChild(script);
        }

        // 产生随机数字
        me.randomNum = function(min, max) {
            return parseInt(Math.random() * (max - min + 1) + min, 10);
        }

        // 打开页面
        me.open = function(url) {
            window.open(url);
        }

        // 返回一个 json 对象的 url 参数形式
        me.toUrlParams = function(obj) {
            // 如果为空
            if(obj == null) {
                return '';
            }
            // 如果已经是String了
            if(typeof obj === 'string') {
                return  obj;
            }
            // 转换
            var str = Object.keys(obj).map(function (key) {
                let pKey = encodeURIComponent(key);
                let pValue = obj[key] == null ? '' : encodeURIComponent(obj[key]); // null 改为空串 
                return pKey + "=" + pValue;
            }).join("&");
            return str;
        }


        // == if 结束
    }

    // ===========================  数组操作   =======================================
    if (true) {

        // 从数组里获取数据,根据指定数据
        me.getArrayField = function(arr, prop){
            var propArr = [];
            for (var i = 0; i < arr.length; i++) {
                propArr.push(arr[i][prop]);
            }
            return propArr;
        }

        // 从数组里获取数据,根据指定数据
        me.arrayGet = function(arr, prop, value){
            for (var i = 0; i < arr.length; i++) {
                if(arr[i][prop] == value){
                    return arr[i];
                }
            }
            return null;
        }

        // 从数组删除指定记录
        me.arrayDelete = function(arr, item){
            if(item instanceof Array) {
                for (let i = 0; i < item.length; i++) {
                    let ite = item[i];
                    let index = arr.indexOf(ite);
                    if (index > -1) {
                        arr.splice(index, 1);
                    }
                }
            } else {
                var index = arr.indexOf(item);
                if (index > -1) {
                    arr.splice(index, 1);
                }
            }
        }

        // 从数组删除指定id的记录
        me.arrayDeleteById = function(arr, id){
            var item = me.arrayGet(arr, 'id', id);
            me.arrayDelete(arr, item);
        }

        // 将数组B添加到数组A的开头
        me.unshiftArray = function(arrA, arrB){
            if(arrB){
                arrB.reverse().forEach(function(ts){
                    arrA.unshift(ts);
                })
            }
            return arrA;
        }

        // 将数组B添加到数组A的末尾
        me.pushArray = function(arrA, arrB){
            if(arrB){
                arrB.forEach(function(ts){
                    arrA.push(ts);
                })
            }
            return arrA;
        }

        // == if 结束
    }

    // ===========================  浏览器相关   =======================================
    if (true) {

        // set cookie 值
        me.setCookie = function setCookie(cname, cvalue, exdays) {
            exdays = exdays || 30;
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toGMTString();
            document.cookie = cname + "=" + escape(cvalue) + "; " + expires + "; path=/";
        }

        // get cookie 值
        me.getCookie = function(objName){
            var arrStr = document.cookie.split("; ");
            for (var i = 0; i < arrStr.length; i++) {
                var temp = arrStr[i].split("=");
                if (temp[0] == objName){
                    return unescape(temp[1])
                };
            }
            return "";
        }

        // 复制指定文本
        me.copyText = function(str){
            var oInput = document.createElement('input');
            oInput.value = str;
            document.body.appendChild(oInput);
            oInput.select(); // 选择对象
            document.execCommand("Copy"); // 执行浏览器复制命令
            oInput.className = 'oInput';
            oInput.style.display='none';
        }

        // jquery序列化表单增强版： 排除空值
        me.serializeNotNull = function(selected){
            var serStr = $(selected).serialize();
            return serStr.split("&").filter(function(str){return !str.endsWith("=")}).join("&");
        }

        // 将cookie序列化为k=v形式
        me.strCookie = function(){
            return document.cookie.replace(/; /g,"&");
        }

        // 回到顶部
        me.goTop = function() {
            function smoothscroll(){
                var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
                if (currentScroll > 0) {
                    window.requestAnimationFrame(smoothscroll);
                    window.scrollTo (0,currentScroll - (currentScroll/5));
                }
            };
            smoothscroll();
        }



        // == if 结束
    }

    // =========================== javascript对象操作   =======================================
    if (true) {
        // 去除json对象中的空值
        me.removeNull = function(obj){
            var newObj = {};
            if(obj != undefined && obj != null) {
                for(var key in obj) {
                    if(obj[key] === undefined || obj[key] === null || obj[key] === '') {
                        //
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
            return newObj;
        }

        // JSON 浅拷贝, 返回拷贝后的obj
        me.copyJSON = function(obj){
            if(obj === null || obj === undefined) {
                return obj;
            };
            var new_obj = {};
            for(var key in obj) {
                new_obj[key] = obj [key];
            }
            return new_obj;
        }

        // 数组浅拷贝, 返回拷贝后的 arr
        me.copyArray = function(arr){
            if(arr === null || arr === undefined) {
                return arr;
            };
            var new_arr = [];
            arr.forEach(function(item) {
                new_arr.push(item);
            })
            return new_arr;
        }

        // json合并, 将 defaulet配置项 转移到 user配置项里 并返回 user配置项
        me.extendJson = function(userOption, defaultOption) {
            if(!userOption) {
                return defaultOption;
            };
            for(var key in defaultOption) {
                if(userOption[key] === undefined) {
                    userOption[key] = defaultOption[key];
                } else if(userOption[key] == null){

                } else if(typeof userOption[key] == "object") {
                    me.extendJson(userOption[key], defaultOption[key]); //深度匹配
                }
            }
            return userOption;
        }

        // == if 结束
    }

    // ===========================  本地集合存储   =======================================
    if (true) {

        // 获取指定key的list
        me.keyListGet = function(key){
            try{
                var str = localStorage.getItem('LIST_' + key);
                if(str == undefined || str == null || str =='' || str == 'undefined' || typeof(JSON.parse(str)) == 'string'){
                    //alert('key' + str);
                    str = '[]';
                }
                return JSON.parse(str);
            }catch(e){
                return [];
            }
        },

            me.keyListSet = function(key, list){
                localStorage.setItem('LIST_' + key, JSON.stringify(list));
            },

            me.keyListHas = function(key, item){
                var arr2 = me.keyListGet(key);
                return arr2.indexOf(item) != -1;
            },

            me.keyListAdd = function(key, item){
                var arr = me.keyListGet(key);
                arr.push(item);
                me.keyListSet(key,arr);
            },

            me.keyListRemove = function(key, item){
                var arr = me.keyListGet(key);
                var index = arr.indexOf(item);
                if (index > -1) {
                    arr.splice(index, 1);
                }
                me.keyListSet(key,arr);
            }

        // == if 结束
    }


    // ===========================  对sa-admin的优化   =======================================
    if (true) {

        // 封装element-ui的导出表格
        // 参数：选择器（默认.data-count），fileName=导出的文件名称
        // me.exportExcel = function(select, fileName) {
        //
        //     // 声明函数
        //     let exportExcel_fn = function(select, fileName) {
        //         // 赋默认值
        //         select = select || '.data-table';
        //         fileName = fileName || 'table.xlsx';
        //         // 开始导出
        //         let wb = XLSX.utils.table_to_book(document.querySelector(select));   // 这里就是表格
        //         // 判断是否使用了 .el-table__fixed
        //         var fix = document.querySelector('.el-table__fixed-right');
        //         if (fix) {
        //             wb = XLSX.utils.table_to_book(document.querySelector(select).removeChild(fix));
        //             document.querySelector(select).appendChild(fix);
        //         }
        //         // 单元表
        //         let sheet = wb.Sheets.Sheet1;
        //         try{
        //             // 强改宽度
        //             sheet['!cols'] = sheet['!cols'] || [];
        //             let thList = document.querySelector(select).querySelectorAll('.el-table__header-wrapper tr th');
        //             for (var i = 0; i < thList.length; i++) {
        //                 // 如果是多选框
        //                 if(thList[i].querySelector('.el-checkbox')) {
        //                     sheet['!cols'].push({ wch: 5 });	// 强改宽度
        //                     continue;
        //                 }
        //                 sheet['!cols'].push({ wch: 15 });	// 强改宽度
        //             }
        //             // 强改高度
        //             sheet['!rows'] = sheet['!rows'] || [];
        //             let trList = document.querySelector(select).querySelectorAll('.el-table__body-wrapper tbody tr');
        //             for (var i = 0; i < trList.length + 1; i++) {
        //                 sheet['!rows'].push({ hpx: 20 });	// 强改高度
        //             }
        //         } catch(e) {
        //             console.err(e);
        //         }
        //         // 开始制作并输出
        //         let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' });
        //         // 点击
        //         let blob = new Blob([wbout], { type: 'application/octet-stream'});
        //         const a= document.createElement("a")
        //         a.href = URL.createObjectURL(blob)
        //         a.download = fileName // 这里填保存成的文件名
        //         a.click()
        //         URL.revokeObjectURL(a.href)
        //         a.remove();
        //         sa.hideLoading();
        //     }
        //     // 导出
        //     sa.loading('正在导出...');
        //     return exportExcel_fn(select, fileName);
        //
        //     // 判断是否首次加载
        //     // sa.loading('正在导出...');
        //     // if(window.XLSX) {
        //     //   return exportExcel_fn(select, fileName);
        //     // } else {
        //     //   me.loadJS('https://unpkg.com/xlsx@0.16.6/dist/xlsx.core.min.js', function() {
        //     //     return exportExcel_fn(select, fileName);
        //     //   });
        //     // }
        //
        // }

        // 刷新表格高度, 请务必在所有表格高度发生变化的地方调用此方法  -- [vue3下不可用]
        me.f5TableHeight = function() {
            const a = true;
            if(a) {
                return;
            }
            nextTick(function() {
                if($('.el-table.data-table .el-table__body-wrapper table').length === 0) {
                    return;
                }
                var _f5Height = function() {
                    // 循环这个页面上的所有表格，重新调整高度
                    $('.el-table.data-table').each(function () {
                        var table = this;
                        var height = $(table).find('.el-table__body-wrapper table').height();
                        height = height === 0 ? 60 : height;
                        // 判断是否有滚动条
                        var tw = $(table).find('.el-table__body-wrapper').get(0);
                        if(tw.scrollWidth > tw.clientWidth) {
                            height = height + 16;
                        }
                        if($(table).find('.el-table__body-wrapper table td').width() === 0) {
                            return;
                        }
                        // 设置高度
                        $(table).find('.el-table__body-wrapper').css('min-height', height);
                        $(table).find('.el-table__body-wrapper').css('max-height', height);
                    })
                };

                setTimeout(_f5Height, 0)
                setTimeout(_f5Height, 200)
            })
        }

        // 在表格查询的页面，监听input回车事件，提交查询
        me.onInputEnter = function(app) {
            Vue.nextTick(function() {
                app = app || window.app;
                // document.querySelectorAll('.el-form input').forEach(function(item) {
                // 	item.onkeydown = function(e) {
                // 		var theEvent = e || window.event;
                // 		var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
                // 		if (code == 13) {
                // 			app.p.pageNo = 1;
                // 			app.f5();
                // 		}
                // 	}
                // })
                document.querySelectorAll('.el-form').forEach(function(item) {
                    item.onkeydown = function(e) {
                        var theEvent = e || window.event;
                        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
                        if (code == 13) {
                            var target = e.target||e.srcElement;
                            if(target.tagName.toLowerCase()=="input") {
                                sa.currView().p.pageNo = 1;
                                sa.currView().f5();
                            }
                        }
                    }
                })
            })
        }

        // 如果value为true，则抛出异常
        me.check = function(value, errorMsg) {
            if(value === true) {
                throw {type: 'sa-error', msg: errorMsg};
            }
        }

        // 如果value为null，则抛出异常
        me.checkNull = function(value, errorMsg) {
            if(me.isNull(value)) {
                throw {type: 'sa-error', msg: errorMsg};
            }
        }

        // 监听窗口变动
        if(!window.onresize) {
            window.onresize = function() {
                try{
                    me.f5TableHeight();
                }catch(e){
                    // console.log(e);
                }
            }
        }

        // 双击layer标题处全屏
        // if(window.$) {
        //     $(document).on('mousedown', '.layui-layer-title', function(e) {
        //         // console.log('单击中');
        //         if(window.layer_title_last_click_time) {
        //             var cz = new Date().getTime() - window.layer_title_last_click_time;
        //             if(cz < 250) {
        //                 console.log('双击');
        //                 $(this).parent().find('.layui-layer-max').click();
        //             }
        //         }
        //         window.layer_title_last_click_time = new Date().getTime();
        //     })
        // }

        // == if 结束
    }




})();


// ===========================  $sys 有关当前系统的方法  一般不能复制到别的项目中用  =======================================
(function(){

    // 超级对象
    var me = {};
    sa.$sys = me;

    // ======================= 登录相关 ============================
    // 写入当前已登陆用户信息
    me.setCurrUser = function(currUser){
        localStorage.setItem('currUser', JSON.stringify(currUser));
    }

    // 获得当前已登陆用户信息
    me.getCurrUser = function(){
        var user = localStorage.getItem("currUser");
        if(user === undefined || user === null || user === 'null' || user === '' || user === '{}' || user.length < 10){
            user = {
                id: '0',
                username: '未登录'
            }
        }else{
            user = JSON.parse(user);
        }
        return user;
    }

    // 如果未登录，则强制跳转到登录
    me.checkLogin = function(not_login_url){
        // console.log(me.getCurrUser());
        if(me.getCurrUser().id === 0) {
            // location.href= not_login_url || '../../login.html';
            sa.openLogin();
            throw '未登录，请先登录';
        }
    }

    // 同上, 只不过是以弹窗的形式显示未登录
    me.checkLoginTs = function(not_login_url){
        if(me.getCurrUser().id === 0) {
            sa.openLogin();
            throw '未登录，请先登录';
        }
    }


    // ========================= 权限验证 =========================

    // 定义key
    var pcode_key = 'permission_code';

    // 写入当前会话的权限码集合
    sa.setAuth = function(codeList) {
        sa.keyListSet(pcode_key, codeList);
    }

    // 获取当前会话的权限码集合
    sa.getAuth = function() {
        return sa.keyListGet(pcode_key);
    }

    // 清除当前会话的权限码集合
    sa.clearAuth = function() {
        sa.keyListSet(pcode_key, []);
    }

    // 检查当前会话是否拥有一个权限码, 返回true和false
    sa.isAuth = function(pcode) {
        return sa.keyListHas(pcode_key, pcode);
    }

    // 检查当前会话是否拥有一个权限码, 如果没有, 则跳转到无权限页面
    // 注意: 非二级目录页面请注意调整路径问题
    sa.checkAuth = function(pcode, not_pcode_url) {
        var is_have = sa.keyListHas(pcode_key, pcode);
        if(is_have == false) {
            location.href= not_pcode_url || '../../sa-view/error-page/403.html';
            throw '暂无权限: ' + pcode;
        }
    }
    // 同上, 只不过是以弹窗的形式显示出来无权限来
    sa.checkAuthTs = function(pcode, not_pcode_url) {
        var is_have = sa.keyListHas(pcode_key, pcode);
        if(is_have == false) {
            var url = not_pcode_url || '../../sa-view/error-page/403.html';
            layer.open({
                type: 2,
                title: false,	// 标题
                shadeClose: true,	// 是否点击遮罩关闭
                shade: 0.8,		// 遮罩透明度
                scrollbar: false,	// 屏蔽掉外层的滚动条
                closeBtn: false,
                area: ['700px', '600px'],	// 大小
                content: url	// 传值
            });
            throw '暂无权限: ' + pcode;
        }
    }



    // ======================= 配置相关 ============================
    // 写入配置信息
    me.setAppCfg = function(cfg) {
        if(typeof cfg != 'string') {
            cfg = JSON.stringify(cfg);
        }
        localStorage.setItem('app_cfg', cfg);
    }

    // 获取配置信息
    me.getAppCfg = function() {
        var app_cfg = sa.JSONParse(localStorage.getItem('app_cfg'), {}) || {};
        return app_cfg;
    }




})();


// =========================== 跳页面相关 避免一次变动，到处乱改 =======================================
(function(){

    // 超级对象
    var me = sa;

    // 打开登录页面
    me.openLogin = function() {
        if(router.currentRoute.value.path === '/login') {
            return;
        }
        router.push(`/login?redirectPath=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
    }

})();


// 如果是sa_admin环境
// window.sa_admin = window.sa_admin || parent.sa_admin || top.sa_admin;
// window.saAdmin = window.sa_admin;

// 如果当前是Vue环境, 则挂在到 Vue 示例
// if (true) {
//   // 全局的 sa 对象
//   Vue.prototype.sa = window.sa;
//   Vue.prototype.sa_admin = window.sa_admin;
//   Vue.prototype.saAdmin = window.saAdmin;
//
//   // 表单校验异常捕获
//   Vue.config.errorHandler = function(err, vm) {
//     if(err.type == 'sa-error') {
//       return sa.error(err.msg);
//     }
//     throw err;
//   }
//
//   // Element-UI 全局组件样式
//   Vue.prototype.$ELEMENT = { size: 'mini', zIndex: 3000 };
//
// }

// 对外开放, 在模块化时解开此注释
export default sa;

