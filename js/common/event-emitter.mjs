export class EventEmitter {
    constructor(){
        this.events = {}
    }
    addEventListener(eventName, triggerFn){
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push({triggerFn, active: true, triggered: false, once: false});
    }
    removeEventListener(eventName, triggerFn){
        for(let i in this.events[eventName])
            if(this.events[eventName][i].triggerFn == triggerFn){
                // this.events[eventName].splice(i, 1);
                this.events[eventName][i].active = false;
                break;
            }
    }

    emit(eventName, ...params){
        if(this.events[eventName])
            for(let event of this.events[eventName]){
                if(event.active)
                    event.triggerFn.call(this, ...params);
            }
    }

}

