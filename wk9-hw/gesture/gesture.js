// import { clear } from "console";

let element = document.documentElement;

// 鼠标事件
element.addEventListener("mousedown", event => {
    start(event)
    let mousemove = event => {
        // console.log(event.clientX, event.clientY);
        move(event)
    }
    let mouseup = event => {
        end(event)
        element.removeEventListener("mousemove", mousemove);
        element.removeEventListener("mouseup", mouseup);
    }
    element.addEventListener("mousemove", mousemove);
    element.addEventListener("mouseup", mouseup);
})

// 触摸屏幕事件
element.addEventListener("touchstart", event => {
    console.log(event.changedTouches)
    for (let touch of event.changedTouches) {
        // console.log("start", touch.clientX, touch.clientY)
        start(touch)
    }
})

element.addEventListener("touchmove", event => {
    for (let touch of event.changedTouches) {
        // console.log("move", touch.clientX, touch.clientY)
        move(touch)
    }
})

element.addEventListener("touchend", event => {
    for (let touch of event.changedTouches) {
        // console.log("end", touch.clientX, touch.clientY)
        end(touch)
    }
})

// touch事件不正常结束时，就是cancel。比如alert事件打断了move事件，就会变成cancel事件
element.addEventListener("touchcancel", event => {
    for (let touch of event.changedTouches) {
        // console.log("cancel", touch.clientX, touch.clientY)
        cancel(touch)
    }
})


let handler;
let startX, startY;
let isPan = false; isTap = true

// 统一鼠标和touch事件
let start = (point) => {
    // console.log("start", point.clientX, point.clientY)
    startX = point.clientX, startY = point.clientY

    isPan = false;
    isTap = true;
    isPress = false

    handler = setTimeout(() => {
        isPan = false;
        isTap = false;
        isPress = true;
        handler = null
        console.log("press")
    }, 500)
}

let move = (point) => {
    let dx = point.clientX - startX, dy = point.clientY - startY
    // 判断移动大于10px
    if (!isPan && dx ** 2 + dy ** 2 > 100){
        isPan = true;
        isTap = false;
        isPress = false
        console.log("panstart")
        clearTimeout(handler)
    }

    if(isPan){
        console.log(dx,dy)
        console.log("pan")
    }

    // console.log("move", point.clientX, point.clientY)
}

let end = (point) => {
    if(isTap){
        console.log("tap")
        clearTimeout(handler)
    }
    if(isPan){
        console.log("panend")
    }
    if(isPress){
        console.log("pressend")
    }
    // console.log("end", point.clientX, point.clientY)
}

let cancel = (point) => {
    clearTimeout(handler)
    console.log("cancel", point.clientX, point.clientY)
}