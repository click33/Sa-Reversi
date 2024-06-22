// 全局异常处理 
import sa from "../sa-frame/sa";

export const initErrorHandler = function (app) {
    // 全局错误处理 
    app.config.errorHandler = function(err, vm, info) {
        if(err.type === 'sa-error') {
            return sa.error(err.msg);
        }
        console.error(err);
    }
}



