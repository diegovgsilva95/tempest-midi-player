
import {PseudoWorkletNode, PseudoAudioContext} from "./processor/wrapper.mjs";
import CanvasVisualization from "./canvas-visualization.mjs";
import MidiIO from "./musical/midi-io.mjs";
import { midiNumberToNote, noteToMidiNumber, midiNumberToHz, hzToMidiNumber } from "./musical/musical-util-v2.mjs";
import { sleep } from "./util.mjs";

//#region Canvas visualization
let canViz = new CanvasVisualization();
//#endregion
//#region Audio Synthesis
const SR = 48000;

let audioMode = 1; 

const ctx = new (audioMode ? AudioContext : PseudoAudioContext)({
    sampleRate: SR
});
await ctx.audioWorklet.addModule("./js/processor/index.mjs");
const procNode = new (audioMode ? AudioWorkletNode : PseudoWorkletNode)(ctx, "test-processor", {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
    processorOptions: {
    }
})
try {
    console.log(procNode.connect(ctx.destination));
} catch(e){
    console.log("Teve erro ao conectar", e)
}
procNode.port.onmessage = function({data}){}

const setFreq = function(f){
    procNode.port.postMessage({
        setFreq: f
    })
}

//#endregion
//#region MIDI Interface

const midiIO = new MidiIO();

if(await midiIO.request({software: true, sysex: true})){
    midiIO.pressedNotes = {};
    const relistNotes = function(){
        let pressed = Object.values(midiIO.pressedNotes);
        canViz.setFreq(pressed);
        setFreq(pressed)
    }
    midiIO.addEventListener("notedown", function({channel, note, velocity}){
        midiIO.pressedNotes[note] = ({
            f: midiNumberToHz(note),
            a: velocity / 127
        })
        relistNotes()
    })
    midiIO.addEventListener("noteup", function({note}){
        delete midiIO.pressedNotes[note];
        relistNotes();
    })
    
}
//#endregion

