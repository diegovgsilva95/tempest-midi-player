export class SineWave {
    constructor(frequency, amplitude = 1){
        this.frequency = frequency;
        this.amplitude = amplitude;

        this.theta = Math.PI * this.frequency * 2 / sampleRate;
        this.phi = 0;
    }
    next(){
        let sample = Math.sin(this.phi);
        this.phi += this.theta;

        return sample * this.amplitude;
    }
    setFreq(newFreq){
        this.frequency = newFreq;
        this.theta = Math.PI * this.frequency * 2 / sampleRate;
    }
    setAmp(newAmp){
        this.amplitude = newAmp;
    }

}