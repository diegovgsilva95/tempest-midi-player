import EventEmitterAudioWorkletProcessor from "./processor-base.mjs";
import {SineWave} from "./sine-wave.mjs";

registerProcessor("test-processor", class extends EventEmitterAudioWorkletProcessor {
    constructor(options){
        super();
        let procOptions = options.processorOptions || {}
        // let numberOfWaves = procOptions.numberOfWaves || 2;
        this.sample = new Float32Array(128);
        this.waves = []; // Para inicializar com sinewaves: Array(numberOfWaves).fill(0).map((v,i)=>new SineWave(0,0));
    }
    processSample(frame){
        let sample = 0;
        for(let wave of this.waves)
            sample += wave.next() / this.waves.length;
        
        return sample;
    }
    setFreq(newFreqs){
        this.waves = [];
        for(let [newFreqIdx, newFreq] of Object.entries(newFreqs))
            this.waves.push(new SineWave(newFreq.f, newFreq.a))   
    }
    
    process(inputs, [output], parameters){
        for(let i in this.sample)
            this.sample[i] = this.processSample((+i)+currentFrame);

        for(let channel of output)
            channel.set(this.sample);
        return true;
    }
});

