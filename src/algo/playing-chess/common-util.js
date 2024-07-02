// 一些常用工具函数 



// 拷贝一个对象 
export const copyObject = function (chess) {
    return JSON.parse(JSON.stringify(chess));
};

// 拷贝对象属性 obj1-> obj2
export const copyProperty = function (obj1, obj2) {
    for (const key in obj1) {
        obj2[key] = obj1[key];
    }
};

// 拷贝一个数组 
export const copyArray = function (array) {
    const newArray = [];
    array.forEach(item => {
        newArray.push(copyObject(item));
    });
    return newArray;
};

// 随机打乱数组内元素顺序 
export const chaosArray = function (array) {
    array.sort((a, b) => Math.random() - 0.5);
};
