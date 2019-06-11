import React, {Component} from 'react';
import './App.css';
import Tone from "tone"

const SEQUENCE_LENGTH = 32

class Sequence {
    constructor(opts) {
        this.title = opts.title
        this.position = opts.position || { x: 0, y: 0}
        this.pitches = opts.pitches
        this.notes = new Array(SEQUENCE_LENGTH*this.pitches.length)
        this.instrument = opts.instrument
    }
    clear() {
        this.notes = new Array(SEQUENCE_LENGTH*this.pitches.length)
    }
    fill() {
        this.notes.fill(1)
    }
}
const sequences = [
    new Sequence({
        title:'synth',
        position: {
            x:10,
            y:10,
        },
        pitches:['C4','D4','E4','F4','G4','A4','B4','C5'],
        instrument:{
            name:'synth1'
        },
    }),
    new Sequence({
        title:'drum',
        position:{
            x:20,
            y:350,
        },
        pitches:['C3','F3'],
        instrument:{
            name:'drum'
        }
    })
]

class SequenceView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            seq:this.props.sequence
        }
    }
    isNoteSelected = (row,col) => {
        const seq = this.props.sequence
        const index = row*SEQUENCE_LENGTH+col
        if(index > this.state.seq.notes.length-1) {
            return false
        }
        return this.state.seq.notes[index]
    }
    toggleNote = (col, pitch, row) => {
        const index = row*SEQUENCE_LENGTH+col
        const old = this.isNoteSelected(row,col)
        const seq = this.state.seq
        seq.notes[index] = !old
        this.setState({seq:seq})
    }

    render() {
        return <div className="sequence-view" style={{
            position:'absolute',
            left:this.props.sequence.position.x,
            top:this.props.sequence.position.y,
            display:'flex',
            flexDirection:'column-reverse'
        }}>
            {
                this.props.sequence.pitches.map((pitch,i)=>{
                    return <SequenceRow key={i}
                                        pitch={pitch}
                                        instrument={this.props.instrument}
                                        isNoteSelected={(col)=>this.isNoteSelected(i,col)}
                                        onToggleNote={(col)=>this.toggleNote(col,pitch,i)}
                                        column={this.props.column}
                    />
                })
            }
        </div>
    }
}

class SequenceRow extends Component {
    render() {
        const beats = []
        for(let i=0; i<SEQUENCE_LENGTH; i++) {
            const selected = this.props.isNoteSelected(i)
            const active = this.props.column === i
            beats.push(<SequenceNote key={i} beat={i} row={this}
                                     selected={selected}
                                     active={active}
                                     onClick={()=>{
                                         this.clicked(i)
                                     }}
            />)
        }
        return <div className="sequence-row">{beats}</div>
    }
    clicked(col) {
        this.props.instrument.triggerAttackRelease([this.props.pitch],'4n')
        this.props.onToggleNote(col)
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
    play = () => {
        this.props.row.play()
        this.props.row.setNote()
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
        const synth = new Tone.PolySynth(8, Tone.Synth, {
            "oscillator": {
                type:'triangle',
                "partials": [0, 2, 3, 4],
                envelope: {
                    attack:0.001,
                    decay : 1.6 ,
                    sustain : 0.0 ,
                    release : 1.6,
                }
            }
        }).toMaster()
        this.state = {
            column:0,
            playing:false,
        }
        this.synth = synth
        const beats = []
        for(let i=0; i<SEQUENCE_LENGTH; i++) beats.push(i)
        const loop = new Tone.Sequence((time, col) => {
            this.setState({column:col})
            sequences.forEach((seq)=>{
                seq.pitches.forEach((pitch,row) => {
                    const index = row * SEQUENCE_LENGTH + col
                    if (index > seq.notes.length - 1) {
                        return false
                    }
                    const val = seq.notes[index]
                    if (val) {
                        console.log("play", seq.title,pitch)
                        this.synth.triggerAttackRelease([pitch], "16n");
                    }
                })
            })

        }, beats, "4n")
            .start(0)

        synth.triggerAttackRelease(["C4", "E4", "A4"], "4n");
        Tone.Transport.on("stop", () => {
            console.log("tone trnasport stopped")
            this.setState({playing:false})
        })
        Tone.Transport.on("start", () => {
            console.log("tone transport started")
            this.setState({playing:true})
        })
        // Tone.Transport.start()
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <button onClick={this.togglePlaying}>
                    {this.state.playing?"stop":"start"}
                </button>
                <button onClick={this.clearBoard}>
                    clear
                </button>
                <button onClick={this.fillBoard}>
                    BBEE AA SSAAVVAAGGEE!!!!!!
                </button>
            <div className="layout-canvas">
                {sequences.map((seq, i) => {
                    return <SequenceView sequence={seq}
                                         key={i}
                                         instrument={this.synth}
                                         column={this.state.column}/>
                })}
            </div>

            </div>
        );
    }
}

export default App;
