// Toca de coelho feita para encapsular um AudioProcessorWorklet 
// simulando como se estivesse num ambiente real de áudio


// ----------- Espaço do wrapper em escopo global da página --------------------


// Ponto de entrada: new PseudoAudioContext({ sampleRate: ... })
export class PseudoAudioContext {
    constructor({sampleRate = 44100}){
        this.sampleRate = sampleRate;
        this.audioWorklet = new PseudoAudioWorklet(this) // importante
        this.currentTime = 0;
        
        this.baseLatency = NaN;
        this.outputLatency = NaN;
        this.state = "running";
        this.destination = this;
        this.listener = null;
        this.onstatechange = null;
    }
}
// Segundo passo: await context.audioWorklet.addModule(url) --> deve preparar o worker
export class PseudoAudioWorklet {
    constructor(context){
        this.catalog = {}
        this.context = context;
    }
    addModule(url){
        return new Promise((res, rej)=>{
            let worker = new Worker(import.meta.url, {
                type: "module"
            });
            worker.postMessage(url);
            let timeout = setTimeout(rej, 5000);
            let self = this;
            worker.onmessage = function({data}){
                clearTimeout(timeout);
                if(data.error){
                    worker.terminate();
                    worker = null;
                    rej(data.error)
                } else {
                    self.catalog[data] = worker;
                    res(data);
                }
            }
        })
    }
}
// Terceiro passo: new PseudoWorkletNode(context, "...", {...})
export class PseudoWorkletNode {
    constructor(pseudoContext, pseudoName, options){
        if(!(pseudoContext instanceof PseudoAudioContext))
            throw TypeError(`Failed to construct '${this.constructor.name}': parameter 1 is not of type 'PseudoAudioContext'.`)
        
        this.context = pseudoContext;

        if(typeof pseudoContext.audioWorklet.catalog[pseudoName] === "undefined")
            throw new DOMException(`Failed to construct '${this.constructor.name}': ${this.constructor.name} cannot be created: The node name '${pseudoName}' is not defined in wrapper scope.`);
        
        this.workletName = pseudoName;
        this.port = pseudoContext.audioWorklet.catalog[pseudoName];
        this.options = options;

    }
    // Quarto passo: pseudoNode.connect(context.destination)
    connect(dest){
        if(dest instanceof PseudoAudioContext){
            this.port.postMessage({name: this.workletName, sampleRate: dest.sampleRate, options: this.options});
        }
    }
}















// ----------- Espaço do wrapper em escopo global do WORKER --------------------
class PseudoWorkletPort {
    constructor(obj){
        this.context = obj;
    }
    postMessage(data){
        postMessage(data)
    }
}
class AudioWorkletProcessor {
    constructor(){
        this.port = new PseudoWorkletPort(this)
    }
}
function registerProcessor(name, ctor){
    console.log(`%cInfo: %cRegistering "${name}" at Wrapper Worker`, "color: #05f; font-weight:bold", "color: #05f");
    this.catalog[name] = ctor;
    return true;
}
async function onWorkerMessage(msg){
    instance.port.onmessage && instance.port.onmessage(msg);
}
async function onBeforeWorkerMessage(msg){
    if(this.messageHandler)
        this.messageHandler(msg);
    else
        this.messageQueue.push(msg);
}
function runWorker(){
    let processingResult = this.process(input, output, null);
    currentFrame += 128;
    currentTime = currentFrame / sampleRate;
    if(processingResult)
        setTimeout(runWorker.bind(this), 1000 * 128 / sampleRate);

}
async function exerciseWorker({data}){
    let preflight = {
        messageQueue: [],
        messageHandler: null
    };

    onmessage = onBeforeWorkerMessage.bind(preflight);
    
    let options = data.options || {};
    
    if(typeof options.numberOfOutputs === "undefined") options.numberOfOutputs = 1;
    if(typeof options.numberOfInputs === "undefined") options.numberOfInputs = 0;
    if(typeof options.outputChannelCount === "undefined") options.outputChannelCount = [1];

    globalThis.sampleRate = data.sampleRate;
    globalThis.currentFrame = 0;
    globalThis.currentTime = 0;
    globalThis.instance = new this.catalog[data.name](data.options);
    
    preflight.messageHandler = onWorkerMessage;
    
    while(preflight.messageQueue.length > 0)
        preflight.messageHandler(preflight.messageQueue.pop());

    globalThis.output = Array(options.numberOfOutputs).fill(0).map((_,i) => Array(options.outputChannelCount[i]).fill(0).map(_ => new Float32Array(128)));
    globalThis.input = Array(options.numberOfInputs).fill(0).map((_,i) => Array(options.channelCount[i]).fill(0).map(_ => new Float32Array(128)));

    runWorker.call(instance)
}
async function loadWorker(url){
    console.log(`%cInfo: %cRequesting "${url}" at Wrapper Worker`, "color: #05f; font-weight:bold", "color: #05f");
    globalThis.AudioWorkletProcessor = AudioWorkletProcessor;
    let catalog = {};
    globalThis.registerProcessor = registerProcessor.bind({catalog});
    try {
        await import("/"+url);
        postMessage(Object.keys(catalog));
        onmessage = exerciseWorker.bind({catalog});
    } catch(e){
        postMessage({
            error: e
        })
    }

}
async function initWorker(){
    console.log("%cInfo: %cLoaded Wrapper Worker for PseudoAudio", "color: #05f; font-weight:bold", "color: #05f");
    onmessage = function({data}){
        onmessage = null;
        loadWorker(data);
    }
}


if(globalThis.constructor.name !== "Window"){ // Rodar apenas em escopo de worker / sharedworker.
    initWorker();
}