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

export class Timeline {
    constructor(){
        this[ANIMATIONS] = new Set()
        this[START_TIME] = new Map()
    }
    start(){
        let startTime = Date.now();
        this[TICK] = () => {
            // console.log("tick");
            let now = Date.now();
            for(let animation of this[ANIMATIONS]){
                let t

                // 动态想timeline添加animation
                if(this[START_TIME].get(animation) < startTime){
                    t = now - startTime
                } else {
                    t = now - this[START_TIME].get(animation)
                }
                
                if (animation.duration < t){
                    this[ANIMATIONS].delete(animation)
                    t = animation.duration
                }
                animation.receive(t)
            }
            requestAnimationFrame(this[TICK])
        }
        this[TICK]();
    }
    pause(){

    }
    resume(){

    }
    reset(){

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
    constructor(object, property, startValue, endValue, duration, delay, timingFuction){
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.timingFuction = timingFuction;
    }
    receive(time){
        console.log(time)
        let range = this.endValue - this.startValue
        this.object[this.property] = this.startValue + range * time / this.duration
    }
}