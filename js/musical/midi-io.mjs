// import {numberToNote, noteToNumber} from "./musical-util.mjs";

import { EventEmitter } from "../common/event-emitter.mjs";
const STATUS_CODES = {
    EV_NOTE_OFF: 8,          // 1000
    EV_NOTE_ON: 9,           // 1001
    EV_NOTE_AFTERTOUCH: 10,       // 1010
    EV_CTRL_CHANGE: 11, 
    EV_PROG_CHANGE: 12,
    EV_CHAN_AFTERTOUCH: 13,
    EV_PITCH_CHANGE: 14,
    EV_CHAN_MSG: 11,
    EV_SYSEX: 15
}
export default class MidiIO extends EventEmitter {
    constructor(){
        super();
        this.options = {}
        this.devices = {
            inputs: [],
            outputs: []
        };
        this.state = {};
        for(let i = 0; i < 15; i++){
            this.state[i] = {
                notes: {}
            };
            for(let j = 0; j < 256; j++)
                this.state[i].notes[j] = {
                    active: false,
                    velocity: 0,
                    lastVelocity: 0,
                    note: j,
                    channel: i,
                    lastOn: null,
                    lastOff: null
                }
        }
    }
    onFailure(msg){
        alert(msg);
        throw new Error(msg);
    }
    onStateChange(ev){
    }
    onSuccess(midiHandler){
        this.midi = midiHandler;
        for(let [_, device] of this.midi.inputs){
            this.devices.inputs.push(device);
            device.onmidimessage = this.handleMsg.bind(this);
        }
        for(let [_, device] of this.midi.outputs)
            this.devices.outputs.push(device)
        midiHandler.onstatechange = this.onStateChange.bind(this);

    }
    async request(options){
        options = options || {};
        options = {...this.options, ...options};
        let midiAccess; 
        try {
            midiAccess = await navigator.requestMIDIAccess(options); 
        } catch(e){
            this.onFailure(e);
            return false;
        }
        this.onSuccess(midiAccess);
        return true;

    }
    onNoteUp(channel, note, velocity){
        let stateNote = this.state[channel].notes[note];

        stateNote.active = false;
        stateNote.lastOff = Date.now();
        stateNote.lastVelocity = stateNote.velocity;
        stateNote.velocity = velocity;

        this.emit("noteup", {channel, note, velocity});
    }
    onNoteDown(channel, note, velocity){
        let stateNote = this.state[channel].notes[note];

        stateNote.active = true;
        stateNote.lastOn = Date.now();
        stateNote.lastVelocity = stateNote.velocity;
        stateNote.velocity = velocity;

        this.emit("notedown", {channel, note, velocity});
    }
    handleMsg({srcElement, data}){
        let statusByte = data[0];
        let hStatus = statusByte>>4;
        let lStatus = statusByte&15;

        if(hStatus == STATUS_CODES.EV_NOTE_OFF)
            return this.onNoteUp(lStatus, data[1], data[2]);
            
        if(hStatus == STATUS_CODES.EV_NOTE_ON)
            return this.onNoteDown(lStatus, data[1], data[2]);

        // TODO: Other status codes
    }      
}