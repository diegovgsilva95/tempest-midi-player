const 
    SCALE = "CDEFGAB",
    FULLSCALE = "CCDDEFFGGAAB",
    SHARPS = "010100101010";

export function midiNumberToNote(note){

    let octave = Math.floor(note / 12) - 1;
    let key = note % 12;

    let 
    // Mathematically:
        // keyName = SCALE[Math.floor(Math.log(key + 1) ** 2)],
        // keySharp = ((keyw * 7 + 6) % 12 < 5) ? "#" : "", 

    // By lookup:
        keyName = FULLSCALE[key], 
        keySharp = SHARPS[key] == "1" ? "#" : "", 
        fullKey = keyName + keySharp + octave;
    
    // If a previous table was built, one could lookup like this:
        // fullKeyByLookup = MAJOR_KEYS.find(({index}) => index == note);
        // if(fullKeyByLookup) fullKeyByLookup = fullKeyByLookup.notes[0];
        // return fullKeyByLookup;

    return fullKey;
};
export function noteToMidiNumber(fullKey){
    let fullKey_rx = fullKey.match(/(?<keyName>[A-G])(?<keySharp>#)?(?<octave>\d+)/);
    
    if(fullKey_rx == null)
        throw TypeError(`Invalid notation ${fullKey}`);

    let 
        {keyName, keySharp, octave} = fullKey_rx.groups,
        key = FULLSCALE.indexOf(keyName);

    octave = +octave;

    if(key < 0 || isNaN(octave))
        throw TypeError(`Invalid notation ${fullKey}`);

    return key + (keySharp ? 1 : 0) + ((octave+1) * 12);
}
export function midiNumberToHz(note){
    return Math.pow(2, (note - 69) / 12) * 440;
}
export function hzToMidiNumber(f){
    return Math.floor(69 + (12 * Math.log2(f / 440)));
}