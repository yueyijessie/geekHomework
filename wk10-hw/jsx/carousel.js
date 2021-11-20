import {Component, STATE, ATTRIBUTE} from "./framework.js"
import { enableGesture } from "../gesture/gesture.js"
import { Timeline, Animation } from "./animation.js"
import {ease} from "./ease.js"

export {STATE, ATTRIBUTE} from "./framework.js";

export class Carousel extends Component {
    constructor(){
        super()
    }
    
    render(){
        this.root = document.createElement("div")
        this.root.classList.add('carousel')
        for(let record of this[ATTRIBUTE].src) {
            let child = document.createElement("div")
            child.style.backgroundImage = `url('${record.img}')`
            this.root.appendChild(child)
        }

        enableGesture(this.root);
        let timeline = new Timeline()
        timeline.start()

        let handler = null

        let children = this.root.children;
        this[STATE].position = 0; // 当前滚动到的位置
        let t = 0; // 现在播放的时间
        let ax = 0; // 动画造成的位移（兼容动画和手势）

        this.root.addEventListener("start", event => {
            console.log('自动播放pause')
            timeline.pause()
            clearInterval(handler)
            if (Date.now() - t < 1500) {
                let progress = (Date.now() - t) / 1500  // 计算动画播放的进度
                ax = ease(progress) * 500 - 500
            } else {
                ax = 0
            }
        })

        this.root.addEventListener("tap", event => {
            this.triggerEvent("click", {
                data: this[ATTRIBUTE].src[this[STATE].position],
                position: this[STATE].position
            })
        })

        this.root.addEventListener("pan", event => {
            console.log('拖拽')
            let x = event.clientX - event.startX - ax
            let current = this[STATE].position -  ((x - x % 500) / 500)
            for(let offset of [-1, 0, 1]) {
                let pos = current + offset
                pos = (pos % children.length + children.length) % children.length // 使用取余运算来循环
                children[pos].style.transition = 'none'
                children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`
            }
        })

        this.root.addEventListener("end", event => {
            timeline.reset()
            timeline.start()
            handler = setInterval(nextPicture, 3000)
            console.log('自动播放start')
            console.log(handler)

            let x = event.clientX - event.startX - ax
            let current = this[STATE].position -  ((x - x % 500) / 500)

            let direction = Math.round((x % 500) / 500)
            console.log(direction)

            if (event.isFlick){
                if (event.velocity < 0){
                    direction = Math.ceil((x % 500) / 500)
                } else {
                    direction = Math.floor((x % 500) / 500)
                }
                console.log(event)
            }

            for(let offset of [-1, 0, 1]) {
                let pos = current + offset
                pos = (pos % children.length + children.length) % children.length // 使用取余运算来循环
                children[pos].style.transition = 'none'
                // children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`

                timeline.add(new Animation(children[pos].style, 'transform',
                    - pos * 500 + offset * 500 + x % 500,
                    - pos * 500 + offset * 500 + direction * 500,
                    500, 0, ease, v => `translateX(${v}px)`))
                console.log(- pos * 500 + offset * 500 + x % 500,
                    - pos * 500 + offset * 500 + direction * 500)
            }

            this[STATE].position = this[STATE].position - ((x - x % 500) / 500) - direction
            this[STATE].position = (this[STATE].position % children.length + children.length) % children.length // 取正数
            this.triggerEvent("change", {position: this[STATE].position})
        })

        let nextPicture = () => {
            let children = this.root.children;
            let nextPosition = (this[STATE].position + 1) % children.length; // 防止轮播超出图片长度的范围
            
            let current = children[this[STATE].position];
            let next = children[nextPosition];

            t = Date.now()

            timeline.add(new Animation(current.style, 'transform',
                - this[STATE].position * 500, -500 - this[STATE].position * 500, 500, 0, ease, v => `translateX(${v}px)`))
            timeline.add(new Animation(next.style, 'transform',
                500 - nextPosition * 500, - nextPosition * 500, 500, 0, ease, v => `translateX(${v}px)`))
            this[STATE].position = nextPosition
            this.triggerEvent("change", {position: this[STATE].position})
        }

        // 自动播放
        handler = setInterval(nextPicture, 3000)
        return this.root;
    }
    
}