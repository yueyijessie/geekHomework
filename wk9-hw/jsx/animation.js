// 1帧约16ms

// 方案一：setInterval不稳定，不一定是16ms执行，也可能发生积压
// setInterval(() => {}, 16)
// let tick = () => {
//     setTimeout(tick, 16)
// }

// 方案二：建议现代浏览器使用这种方式
// let tick = () => {
//     let handler = requestAnimationFrame(tick)
//     cancelAnimationFrame(handler)
// }

const TICK = Symbol('tick');
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATIONS = Symbol('animations');
const START_TIME = Symbol('start-time');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');

export class Timeline {
    constructor(){
        this.state = "Inited"
        this[ANIMATIONS] = new Set()
        this[START_TIME] = new Map()
    }
    start(){
        if (this.state !== "Inited"){
            return;
        }
        this.state = "started"
        let startTime = Date.now();
        this[PAUSE_TIME] = 0
        this[TICK] = () => {
            // console.log("tick");
            let now = Date.now();
            for(let animation of this[ANIMATIONS]){
                let t

                // 动态想timeline添加animation
                if(this[START_TIME].get(animation) < startTime){
                    t = now - startTime - this[PAUSE_TIME] - animation.delay 
                } else {
                    t = now - this[START_TIME].get(animation)  - this[PAUSE_TIME] - animation.delay 
                }
                
                if (animation.duration < t){
                    this[ANIMATIONS].delete(animation)
                    t = animation.duration
                }

                if (t > 0){
                    animation.receive(t)
                }
            }
            this[TICK_HANDLER] = requestAnimationFrame(this[TICK])
        }
        this[TICK]();
    }
    pause(){
        if (this.state !== "started"){
            return;
        }
        this.state = "paused"
        this[PAUSE_START] = Date.now()
        cancelAnimationFrame(this[TICK_HANDLER])
    }
    resume(){
        if (this.state !== "paused"){
            return;
        }
        this.state = "started"
        this[PAUSE_TIME] += Date.now() - this[PAUSE_START]
        this[TICK]();
    }
    reset(){
        this.pause();
        this.state = "inited"
        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this[PAUSE_START] = 0;
        this[TICK_HANDLER] = null;
    }
    add(animation, startTime){
        if (arguments.length < 2){
            // 参数数量不足时，给默认值
            startTime = Date.now() 
        }
        this[ANIMATIONS].add(animation)
        this[START_TIME].set(animation, startTime)
    }
}

export class Animation {
    constructor(object, property, startValue, endValue, duration, delay, timingFuction, template){
        timingFuction = timingFuction || (v => v)
        template = template || (v => v)
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.timingFuction = timingFuction;
        this.template = template;
    }
    receive(time){
        let range = this.endValue - this.startValue
        let progress = this.timingFuction(time / this.duration)
        this.object[this.property] = this.template(this.startValue + range * progress)
    }
}