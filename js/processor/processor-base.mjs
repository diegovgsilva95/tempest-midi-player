
export default class EventEmitterAudioWorkletProcessor extends AudioWorkletProcessor {
    constructor(){
        super();
        this.port.onmessage = this.onmessage.bind(this);
    }
    onmessage({data}){
        if(typeof data === "object")
            for(let fnName of Object.keys(data))
                if(typeof this[fnName] === "function")
                    this[fnName].bind(this)(data[fnName]);
                else
                    throw new ReferenceError(`${this.constructor.name || "(anonymous)"}.${fnName} does not exist`);
        else
            throw new TypeError(`Invalid message type "${typeof data}" for ${this.constructor.name || "(anonymous)"}.port.postMessage`);
    }
}