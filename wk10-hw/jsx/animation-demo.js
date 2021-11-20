import {Timeline, Animation} from "./animation.js"
import {ease, easeIn} from "./ease.js"

let tl = new Timeline();
tl.start();

tl.add(new Animation(document.querySelector("#el").style, "transform",
 0, 500, 2000, 0, easeIn, v => `translate(${v}px)`));

// 添加css的动画效果，进行对比
document.querySelector("#el2").style.transition = 'transform ease-in 2s'
document.querySelector("#el2").style.transform = 'translateX(500px)'

// 添加暂停继续事件
document.querySelector("#pause-btn").addEventListener("click", () => tl.pause())
document.querySelector("#resume-btn").addEventListener("click", () => tl.resume())
document.querySelector("#reset-btn").addEventListener("click", () => tl.reset())

// window.tl = tl;
// window.animation = new Animation({
//     set a(v) { console.log(v)}
// }, "a", 0, 100, 1000, null)