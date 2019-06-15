import React, {Component} from 'react'
import './App.css'
import Tone from "tone"
import {ResizeHandler} from './ResizeHandler'
import {MoveHandler} from './MoveHandler'

const SEQUENCE_LENGTH = 32

class Sequence {
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
}
const SYNTHS = {
    kalimba: new Tone.FMSynth({
        "harmonicity":8,
        "modulationIndex": 2,
        "oscillator" : {
            "type": "sine"
        },
        "envelope": {
            "attack": 0.001,
            "decay": 2,
            "sustain": 0.1,
            "release": 2
        },
        "modulation" : {
            "type" : "square"
        },
        "modulationEnvelope" : {
            "attack": 0.002,
            "decay": 0.2,
            "sustain": 0,
            "release": 0.2
        }
    }).toMaster(),
    marimba: new Tone.Synth({
        "oscillator": {
            "partials": [
                1,
                0,
                2,
                0,
                3
            ]
        },
        "envelope": {
            "attack": 0.001,
            "decay": 1.2,
            "sustain": 0,
            "release": 1.2
        }
    }).toMaster(),
    fatsawtooth: new Tone.MonoSynth({
            oscillator : {
                type : 'fatsawtooth',
            },
            envelope : {
                attack : 0.05 ,
                decay : 0.3 ,
                sustain : 0.4 ,
                release : 0.8
            },
        }).toMaster(),
    base: new Tone.MonoSynth({
        "oscillator": {
            "type": "fmsquare5",
            "modulationType" : "triangle",
            "modulationIndex" : 2,
            "harmonicity" : 0.501
        },
        "filter": {
            "Q": 1,
            "type": "lowpass",
            "rolloff": -24
        },
        "envelope": {
            "attack": 0.01,
            "decay": 0.1,
            "sustain": 0.4,
            "release": 2
        },
        "filterEnvelope": {
            "attack": 0.01,
            "decay": 0.1,
            "sustain": 0.8,
            "release": 1.5,
            "baseFrequency": 50,
            "octaves": 4.4
        }
    }).toMaster(),
    slap: new Tone.NoiseSynth({
        "noise": {
            "type": "white",
            "playbackRate" : 5
        },
        "envelope": {
            "attack": 0.001,
            "decay": 0.3,
            "sustain": 0,
            "release": 0.3
        }
    }).toMaster(),
}

const sequences = [
    new Sequence({
        title:'synth',
        position: { x:10, y:30, },
        pitches:['C4','D4','E4','F4','G4','A4','B4','C5'],
        startPitch:0,
        pitchCount:2,
        pitched:true,
        instrument:{
            name:'synth1',
            synth: SYNTHS.kalimba
        },
    }),
    new Sequence({
        title:'base',
        position:{ x:10, y:300, },
        pitches:['C3','C4'],
        startPitch:0,
        pitchCount:2,
        pitched:true,
        instrument:{
            name:'drum',
            synth: SYNTHS.base
        }
    }),
    new Sequence({
        title:'slap',
        position: {  x:10,  y:300, },
        pitches:['C4'],
        startPitch:0,
        pitched:false,
        pitchCount:1,
        instrument: {
            name:'slap',
            synth: SYNTHS.slap
        }
    })
]

class SequenceView extends Component {
    movePitchUp = () => {
        const seq = this.props.sequence
        if(seq.startPitch + seq.pitchCount < seq.pitches.length) {
            seq.startPitch +=1
            this.setState({seq:this.state.seq})
        }
    }
    movePitchDown = () => {
        const seq = this.props.sequence
        if(seq.startPitch > 0) {
            seq.startPitch -= 1
            this.setState({seq:this.state.seq})
        }

    }

    constructor(props) {
        super(props)
        this.state = {
            seq:this.props.sequence,
            visibleCols:4,
        }
    }
    toggleNote = (col, pitch, row) => {
        const seq = this.state.seq
        if(seq.pitched) {
            seq.instrument.synth.triggerAttackRelease(pitch, '4n')
        } else {
            seq.instrument.synth.triggerAttackRelease('4n')
        }

        seq.toggleNoteAt(row,col)
        this.setState({seq:this.state.seq})
    }

    mousePressed = (e) => {
        e.stopPropagation()
        new MoveHandler(e,this.props.sequence,this.div,({x,y})=>{
            this.setState({seq:this.props.sequence})
        })
    }


    resizePressed = (e) => {
        e.stopPropagation()
        new ResizeHandler(e,this.props.sequence, this.div, ({w,h})=>{
            const seq = this.props.sequence
            const quant = 24
            w = Math.floor(w/quant)*quant
            h = Math.floor(h/quant)*quant
            seq.dimension.w = w
            seq.dimension.h = h
            const rows = Math.floor(h/24) -2
            if(rows <= seq.pitches.length) seq.pitchCount = rows
            const vc = w/24-4
            this.props.sequence.maxNotes = vc
            this.setState({seq:this.props.sequence, visibleCols: vc})
        })
    }

    render() {
        return <div className="sequence-view" style={{
            position:'absolute',
            left:this.props.sequence.position.x,
            top:this.props.sequence.position.y,
            width: this.props.sequence.dimension.w,
            height: this.props.sequence.dimension.h,
            display:'flex',
            flexDirection:'column-reverse',
        }}
                    onMouseDown={this.mousePressed}
                    ref={(div)=>this.div = div}
        >
            <div className={'hbox'}>
                <button onClick={this.movePitchUp}>up</button>
                <button onClick={this.movePitchDown}>down</button>
                <div className={'spacer'}></div>
                <button onMouseDown={this.resizePressed}>_|</button>
            </div>
            {
                this.renderRows(this.props.sequence)
            }
            <div className={"title"}>{this.props.sequence.title}</div>
        </div>
    }

    renderRows(seq) {
        const rows = []
        const end = seq.startPitch+seq.pitchCount
        for(let i=seq.startPitch; i<end; i++) {
            const pitch = seq.pitches[i]
            rows.push(<SequenceRow key={i}
                                   pitch={pitch}
                                   row={i}
                                   sequence={seq}
                                   onToggleNote={(col)=>this.toggleNote(col,pitch,i)}
                                   column={this.props.column}
                                   visibleColumns={this.state.visibleCols}
            />)
        }
        return rows
    }
}

class SequenceRow extends Component {
    render() {
        const beats = []
        const len = this.props.sequence.maxNotes
        for(let i=0; i<len; i++) {
            const selected = this.props.sequence.isNoteAt(this.props.row,i)
            const active = (this.props.column%this.props.sequence.maxNotes) === i
            beats.push(<SequenceNote key={i} beat={i} row={this}
                                     selected={selected}
                                     active={active}
                                     onClick={()=>{
                                         this.props.onToggleNote(i)
                                     }}
            />)
        }
        return <div className="sequence-row"><div className={"pitch"}>{this.props.pitch}</div>{beats}</div>
    }
}

class SequenceNote extends Component {
    render() {
        const style = {}
        const colors = ['#ccc','blue','#f0f0f0','aqua']
        const index = (this.props.selected?1:0) + (this.props.active?2:0)
        style.backgroundColor = colors[index]
        return <button style={style}  className="note" onClick={this.props.onClick}>♾️</button>
    }
}

export class App extends Component {
    togglePlaying = () => {
        Tone.Transport.toggle()
    }
    clearBoard = () => {
        sequences.forEach(seq => seq.clear())
        this.setState({column:0})
    }
    fillBoard = () => {
        sequences.forEach(seq => seq.fill())
        this.setState({column:0})
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            column:0,
            playing:false,
        }
        const beats = []
        for(let i=0; i<SEQUENCE_LENGTH; i++) beats.push(i)
        const loop = new Tone.Sequence((time) => {
            sequences.forEach((seq)=>{
                seq.playColumn(this.state.column)
            })
            this.setState({column:this.state.column+1})

        }, beats, "8n")
            .start(0)

        // synth.triggerAttackRelease("C4", "8n");
        Tone.Transport.on("stop", () => {
            this.setState({playing:false, column:0})
        })
        Tone.Transport.on("start", () => {
            this.setState({playing:true, column:0})
        })
        // Tone.Transport.start()
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <div className="layout-canvas">
                    {sequences.map((seq, i) => {
                        return <SequenceView sequence={seq}
                                             key={i}
                                             instrument={this.synth}
                                             column={this.state.column}/>
                    })}
                </div>
                <div className={"toolbar"}>
                    <button onClick={this.togglePlaying}>
                        {this.state.playing?"stop":"start"}
                    </button>
                    <button onClick={this.clearBoard}>
                        clear
                    </button>
                    <button onClick={this.fillBoard}>
                        BBEE AA SSAAVVAAGGEE!!!!!!
                    </button>
                </div>

            </div>
        );
    }
}

export default App;
