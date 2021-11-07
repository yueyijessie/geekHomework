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

export class Timeline {
    constructor(){
        this[ANIMATIONS] = new Set()
    }
    start(){
        let startTime = Date.now();
        this[TICK] = () => {
            // console.log("tick");
            let t = Date.now() - startTime;
            for(let animation of this[ANIMATIONS]){
                let t0 = t // 处理超出范围的问题
                if (animation.duration < t){
                    this[ANIMATIONS].delete(animation)
                    t0 = animation.duration
                }
                animation.receive(t0)
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
    add(animation){
        this[ANIMATIONS].add(animation)
    }
}

export class Animation {
    constructor(object, property, startValue, endValue, duration, timingFuction){
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.timingFuction = timingFuction;
    }
    receive(time){
        console.log(time)
        let range = this.endValue - this.startValue
        this.object[this.property] = this.startValue + range * time / this.duration
    }
}