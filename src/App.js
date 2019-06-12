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
}
const sequences = [
    new Sequence({
        title:'synth',
        position: {
            x:10,
            y:0,
        },
        pitches:['C4','D4','E4','F4','G4','A4','B4','C5'],
        instrument:{
            name:'synth1'
        },
    }),
    new Sequence({
        title:'drum',
        position:{
            x:10,
            y:260,
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
    toggleNote = (col, pitch, row) => {
        this.props.instrument.triggerAttackRelease(pitch,'4n')
        this.state.seq.toggleNoteAt(row,col)
        const seq = this.state.seq
        this.setState({seq:this.state.seq})
    }
    mousePressed = (e) => {
        this.offsetX = e.clientX - e.target.getBoundingClientRect().x
        this.offsetY = e.clientY - e.target.getBoundingClientRect().y
        window.addEventListener('mousemove',this.mouseMoved)
        window.addEventListener('mouseup',this.mouseReleased)
    }
    mouseMoved = (e) => {
        this.props.sequence.position.x = e.clientX - this.offsetX
        this.props.sequence.position.y = e.clientY - this.offsetY
        this.setState({seq:this.props.sequence})
    }
    mouseReleased = (e) => {
        window.removeEventListener('mousemove',this.mouseMoved)
        window.removeEventListener('mouseup',this.mouseReleased)
    }
    render() {
        return <div className="sequence-view" style={{
            position:'absolute',
            left:this.props.sequence.position.x,
            top:this.props.sequence.position.y,
            display:'flex',
            flexDirection:'column-reverse',
        }}
                    onMouseDown={this.mousePressed}
        >
            {
                this.props.sequence.pitches.map((pitch,i)=>{
                    return <SequenceRow key={i}
                                        pitch={pitch}
                                        row={i}
                                        sequence={this.props.sequence}
                                        onToggleNote={(col)=>this.toggleNote(col,pitch,i)}
                                        column={this.props.column}
                    />
                })
            }
            <div className={"title"}>{this.props.sequence.title}</div>
        </div>
    }
}

class SequenceRow extends Component {
    render() {
        const beats = []
        for(let i=0; i<SEQUENCE_LENGTH; i++) {
            const selected = this.props.sequence.isNoteAt(this.props.row,i)
            const active = this.props.column === i
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
        const synth = new Tone.MonoSynth(
            {
                oscillator : {
                    type : 'fatsawtooth',
                }
                ,
                envelope : {
                    attack : 0.05 ,
                    decay : 0.3 ,
                    sustain : 0.4 ,
                    release : 0.8
                }
                ,
                /*
                filterEnvelope : {
                    attack : 0.06 ,
                    decay : 0.2 ,
                    sustain : 0.5 ,
                    release : 2 ,
                    baseFrequency : 200 ,
                    octaves : 7 ,
                    exponent : 2
                }
                 */
            }
        ).toMaster()
        // var synth = new Tone.FatOscillator("Ab3", "sine", "square").toMaster().start();
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
                        // console.log("play", seq.title,pitch)
                        this.synth.triggerAttackRelease(pitch, "8n");
                    }
                })
            })

        }, beats, "8n")
            .start(0)

        synth.triggerAttackRelease("C4", "8n");
        Tone.Transport.on("stop", () => {
            this.setState({playing:false})
        })
        Tone.Transport.on("start", () => {
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
