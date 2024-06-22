// 全局解决页面元素滚动报错的问题
;(function () {
    if (typeof EventTarget !== 'undefined') {
        const func = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, fn, capture) {
            this.func = func;
            if (typeof capture !== 'boolean') {
                capture = capture || {};
                capture.passive = false;
            }
            this.func(type, fn, capture);
        };
    }
})();
