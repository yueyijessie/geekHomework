// let element = document.documentElement;

// let handler;
// let startX, startY;
// let isPan = false, isTap = true, isPress = false;

export class Dispatcher{
    constructor(element){
        this.element = element;
    }
    dispatch(type, properties){
        let event = new Event(type);
        // console.log(event);
        for (let name in properties) {
            event[name] = properties[name];
        }
        this.element.dispatchEvent(event)
    }
}

// listen => recognize => dispatch

// new Listener(new Recognizer(dispatch))

export class Listener {
    constructor(element, recognizer){
        let isListeningMouse = false;
        let contexts = new Map();
        // 鼠标事件
        element.addEventListener("mousedown", event => {
            // console.log(event.button) // 查看按的是左键，右键，中键
            let context = Object.create(null); // 创建空对象的方法，避免原始属性出现
            contexts.set("mouse" + (1 << event.button), context);
            recognizer.start(event, context);

            let mousemove = event => {
                // console.log(event.clientX, event.clientY);
                // move事件不区分按哪个键，但用event.buttons掩码表示按了什么， 0b00001表示左键
                let button = 1
                while (button <= event.buttons){
                    if (button & event.buttons){
                        // 鼠标中键和右键顺序相反，order of buttoms & button property is not same
                        let key;
                        if(button === 2){
                            key = 4
                        }
                        else if(button === 4){
                            key = 2
                        } else {
                            key = button
                        }
                        let context = contexts.get("mouse" + key);
                        recognizer.move(event, context)
                    }
                    button =  button << 1
                }
            }
            let mouseup = event => {
                // console.log("end", event.button)
                let context = contexts.get("mouse" + (1 << event.button));
                recognizer.end(event, context)
                contexts.delete("mouse" + (1 << event.button))

                if(event.buttons === 0){
                    document.removeEventListener("mousemove", mousemove);
                    document.removeEventListener("mouseup", mouseup);
                    isListeningMouse = false;
                }
            }
            if (!isListeningMouse){
                document.addEventListener("mousemove", mousemove);
                document.addEventListener("mouseup", mouseup);
                isListeningMouse = true;
            }
        })

        // 触摸屏幕事件
        element.addEventListener("touchstart", event => {
            console.log(event.changedTouches)
            for (let touch of event.changedTouches) {
                // console.log("start", touch.clientX, touch.clientY)
                let context = Object.create(null);
                contexts.set(touch.identifier, context)
                recognizer.start(touch, context)
            }
        })

        element.addEventListener("touchmove", event => {
            for (let touch of event.changedTouches) {
                // console.log("move", touch.clientX, touch.clientY)
                let context = contexts.get(touch.identifier)
                recognizer.move(touch, context)
            }
        })

        element.addEventListener("touchend", event => {
            for (let touch of event.changedTouches) {
                // console.log("end", touch.clientX, touch.clientY)
                let context = contexts.get(touch.identifier)
                recognizer.end(touch, context)
                contexts.delete(touch.identifier)
            }
        })

        // touch事件不正常结束时，就是cancel。比如alert事件打断了move事件，就会变成cancel事件
        element.addEventListener("touchcancel", event => {
            for (let touch of event.changedTouches) {
                // console.log("cancel", touch.clientX, touch.clientY)
                let context = contexts.get(touch.identifier)
                recognizer.cancel(touch)
                contexts.delete(touch.identifier)
            }
        })
    }
}

export class Recognizer {
    constructor(dispatcher){
        this.dispatcher = dispatcher
    }
    // 统一鼠标和touch事件
    start(point, context) {
        // console.log("start", point.clientX, point.clientY)
        context.startX = point.clientX, context.startY = point.clientY

        this.dispatcher.dispatch("start", {
            clientX: point.clientX,
            clientY: point.clientY
        })

        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        }]

        context.isPan = false;
        context.isTap = true;
        context.isPress = false;

        context.handler = setTimeout(() => {
            context.isPan = false;
            context.isTap = false;
            context.isPress = true;
            context.handler = null
            this.dispatcher.dispatch("press", {})
        }, 500)
    }
    move(point, context) {
        let dx = point.clientX - context.startX, dy = point.clientY - context.startY
        // 判断移动大于10px
        if (!context.isPan && dx ** 2 + dy ** 2 > 100){
            context.isPan = true;
            context.isTap = false;
            context.isPress = false;
            context.isVertical = Math.abs(dx) < Math.abs(dy) // 上下滑还是左右滑
            this.dispatcher.dispatch("panstart", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical
            })
            clearTimeout(context.handler)
        }
    
        if(context.isPan){
            this.dispatcher.dispatch("pan", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical
            })
            // console.log(dx,dy)
            // console.log("pan")
        }
        context.points = context.points.filter(point => Date.now() - point.t < 500)
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        })
    }
    end(point, context) {
        if(context.isTap){
            // console.log("tap")
            this.dispatcher.dispatch("tap", {})
            clearTimeout(context.handler)
        }
        
        if(context.isPress){
            this.dispatcher.dispatch("pressend", {})
            // console.log("pressend")
        }
        context.points = context.points.filter(point => Date.now() - point.t < 500)
        
        let d, v;
        if (!context.points.length){
            v = 0;
        } else {
            d = Math.sqrt((point.clientX - context.points[0].x) ** 2 +
                (point.clientY - context.points[0].y) ** 2)
            v = d / (Date.now() - context.points[0].t)
        }
    
        if (v > 1.5){
            // console.log("flick")
            this.dispatcher.dispatch("flick", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: v
            })
            context.isFlick = true
        } else {
            context.isFlick = false
        }

        if(context.isPan){
            // console.log("panend")
            this.dispatcher.dispatch("panend", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: v
            })
        }
        this.dispatcher.dispatch("end", {
            startX: context.startX,
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
            isVertical: context.isVertical,
            isFlick: context.isFlick,
            velocity: v
        })

        // console.log(v)
        // console.log("end", point.clientX, point.clientY)
    }
    cancel(point, context) {
        clearTimeout(context.handler)
        this.dispatcher.dispatch("cancel", {})
        // console.log("cancel", point.clientX, point.clientY)
    }

}

export function enableGesture(element){
    new Listener(element, new Recognizer(new Dispatcher(element)))
}

