import {Component, createElement} from "./framework.js"

class Carousel extends Component {
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

        // 手动播放——拖拽
        this.root.addEventListener('mousedown', event => {
            console.log('mousedown')

            let move = event => {
                console.log("mousemove")
            }

            let up = event => {
                console.log("mouseup")
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

let d = [
    "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
    "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
    "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
    "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg"
]

let a = <Carousel src={d}/>
a.mountTo(document.body);