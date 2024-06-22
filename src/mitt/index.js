import mitt from 'mitt'

/*
 * mitt 事件订阅发布，目前已实现：
 *      f5CurrView  刷新当前视图
 *      setScroll  设置 tab-bar 滚动条
 *      scrollToAuto  让 tab-bar 滚动条自动归到一个合适的位置
 */
export default mitt();