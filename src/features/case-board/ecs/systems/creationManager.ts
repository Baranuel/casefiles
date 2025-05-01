import { Engine } from "..";
import { System } from "../../interfaces";
import { InputSystem } from "./inputSystem";

export class CreationSystem implements System {
    engine: Engine
    inputSystem: InputSystem | undefined

    constructor(engine: Engine) {
        this.engine = engine
        this.inputSystem = this.engine.getSystem('InputSystem') 
    }

    update(){
        console.log('mousePosition', this.inputSystem?.getMousePosition())
    }
    draw(){}


    destroy() { }
}
