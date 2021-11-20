import {Component, STATE, ATTRIBUTE, createElement} from "./framework.js"
import { enableGesture } from "../gesture/gesture.js"

export {STATE, ATTRIBUTE} from "./framework.js";


export class Button extends Component {
    constructor(){
        super()
    }

    render(){
        // js中所有标签都可自封闭
        this.childContainer = <span />;
        this.root = (<div>{this.childContainer}</div>).render();
        return this.root;
    }

    appendChild(child){
        if (!this.childContainer){
            this.render();
        }
        this.childContainer.appendChild(child);
    }

}