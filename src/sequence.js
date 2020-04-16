export const SEQUENCE_LENGTH = 32

export class Sequence {
    constructor(opts) {
        this.title = opts.title
        this.position = opts.position || { x: 0, y: 0}
        this.dimension = { w: 400, h: 100 }
        this.pitches = opts.pitches
        this.startPitch = opts.startPitch
        this.pitchCount = opts.pitchCount
        this.pitched = opts.pitched || false
        this.notes = new Array(SEQUENCE_LENGTH*this.pitches.length)
        this.maxNotes = 4
        this.instrument = opts.instrument
    }
    isNoteAt(pitch, col) {
        const index = pitch*SEQUENCE_LENGTH+col
        if(index > this.notes.length-1) {
            return false
        }
        return this.notes[index]
    }
    toggleNoteAt(row,col) {
        const index = row*SEQUENCE_LENGTH+col
        const old = this.isNoteAt(row,col)
        this.notes[index] = !old
    }
    clear() {
        this.notes = new Array(SEQUENCE_LENGTH*this.pitches.length)
    }
    fill() {
        this.notes.fill(1)
    }
    playColumn(col) {
        this.pitches.forEach((pitch,row) => {
            const val = this.isNoteAt(row,col%this.maxNotes)
            if (val) {
                if(this.pitched) {
                    this.instrument.synth.triggerAttackRelease(pitch, '8n')
                } else {
                    this.instrument.synth.triggerAttackRelease('8n')
                }
            }
        })
    }
    toJSON() {
        return {
            type:'sequence',
            title:this.title,
            position:this.position,
            dimension:this.dimension,
            pitches:this.pitches.slice(),
            startPitch:this.startPitch,
            pitchCount:this.pitchCount,
            pitched:this.pitched,
            notes:this.notes.slice(),
            maxNotes:this.maxNotes,
            instrument:{
                name:this.instrument.name,
                synthkey:this.instrument.synthkey,
            },
        }
    }

    static fromJSONObject(seq, synth_map) {
        console.log("processing sequence from",seq)
        let opts = {
            title:seq.title,
            position:seq.position,
            dimension:seq.dimension,
            pitches:seq.pitches.slice(),
            startPitch:seq.startPitch,
            pitchCount:seq.pitchCount,
            pitched:seq.pitched,
            notes: seq.notes.slice(),
            maxNotes:seq.maxNotes,
            instrument:{
                name:seq.instrument.name,
                synthkey: seq.instrument.synthkey,
                synth: synth_map[seq.instrument.synthkey]
            },
        }
        return new Sequence(opts)
    }
}
