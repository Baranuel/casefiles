import { System } from "@/types/engine";
import { Engine } from "..";

export class EventSystem implements System { 
    engine:Engine;
    private listeners: Map<string, Array<(data: unknown) => void>> = new Map();

    constructor(engine:Engine){
        this.engine = engine
    }

    public subscribe(eventName: string, callback: (data: unknown) => void){ 
        if(!this.listeners.has(eventName)){
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)?.push(callback);
    }

    public unsubscribe(eventName: string, callback: <T>(data: T) => void){ 
        const callbacks = this.listeners.get(eventName) || [];
        const newCallbacks = callbacks.filter(cb => cb !== callback);
        this.listeners.set(eventName, newCallbacks);
    }

    public emit<T>(eventName: string, data:T){ 
        const callbacks = this.listeners.get(eventName) || [];
        callbacks.forEach(callback => callback(data));  
    }

    update(){}
    draw(){}

    destroy(){
        this.listeners.clear()
    }
}