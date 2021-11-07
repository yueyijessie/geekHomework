import {Component} from "./framework.js"

export class Carousel extends Component {
    constructor(){
        super()
        this.attributes = Object.create(null)
    }
    setAttribute(name, value){
        this.attributes[name] = value
    }
    render(){
        console.log(this.attributes.src);
        this.root = document.createElement("div")
        this.root.classList.add('carousel')
        for(let record of this.attributes.src) {
            let child = document.createElement("div")
            child.style.backgroundImage = `url('${record}')`
            this.root.appendChild(child)
        }

        let position = 0;

        // 手动播放——拖拽
        this.root.addEventListener('mousedown', event => {
            let children = this.root.children;
            let startX = event.clientX, startY = event.clientY

            let move = event => {
                // event.clientX, event.clientY, 得到每次move的一系列坐标
                let x = event.clientX - startX, y = event.clientY - startY

                let current = position -  ((x - x % 500) / 500)
                for(let offset of [-1, 0, 1]) {
                    let pos = current + offset
                    pos = (pos + children.length) % children.length // 使用取余运算来循环
                    children[pos].style.transition = 'none'
                    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`
                }
            }

            let up = event => {
                let x = event.clientX - startX
                position = position - Math.round(x / 500)
                // Math.sign() 正数返回1，负数返回-1
                for(let offset of [0, - Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
                    let pos = position + offset
                    pos = (pos + children.length) % children.length // 使用取余运算来循环
                    children[pos].style.transition = ''
                    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500}px)`
                }
                // 使用document监听，可以避免鼠标在down后移出图片，或者移出浏览器外，丢失up事件
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            }

            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        })

        

        // 自动播放功能
        // let currentIndex = 0;
        // setInterval(() => {
        //     let children = this.root.children;
        //     let nextIndex = (currentIndex + 1) % children.length; // 防止轮播超出图片长度的范围
            
        //     let current = children[currentIndex];
        //     let next = children[nextIndex];

        //     next.style.transition = 'none'; //  最后一个到第一个图片切换是取消动画
        //     next.style.transform = `translateX(${100 - nextIndex * 100}%)`

        //     setTimeout(() => {
        //         next.style.transition = '';
        //         current.style.transform = `translateX(${-100 - currentIndex * 100}%)`
        //         next.style.transform = `translateX(${- nextIndex * 100}%)`
                
        //         currentIndex = nextIndex
        //     }, 16) // 防止style被覆盖， 16ms是浏览器中一帧的时间
            
        // }, 3000)

        return this.root;
    }
    mountTo(parent){
        parent.appendChild(this.render())
    }
}