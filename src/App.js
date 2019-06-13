import React, {Component} from 'react';
import './App.css';
import Tone from "tone"

const SEQUENCE_LENGTH = 32

class Sequence {
    constructor(opts) {
        this.title = opts.title
        this.position = opts.position || { x: 0, y: 0}
        this.dimension = { w: 100, h: 100 }
        this.pitches = opts.pitches
        this.startPitch = opts.startPitch
        this.pitchCount = opts.pitchCount
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
            y:30,
        },
        pitches:['C4','D4','E4','F4','G4','A4','B4','C5'],
        startPitch:0,
        pitchCount:2,
        instrument:{
            name:'synth1',
            synth: new Tone.MonoSynth(
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
                }
            ).toMaster()
        },
    }),
    new Sequence({
        title:'drum',
        position:{
            x:10,
            y:300,
        },
        pitches:['C3','F3'],
        startPitch:0,
        pitchCount:2,
        instrument:{
            name:'drum',
            synth: new Tone.MonoSynth(
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
                }
            ).toMaster()
        }
    })
]

class ResizeHandler {
    constructor(e, sequence, div, callback) {
        this.callback = callback
        this.seq = sequence
        this.resizeX = e.clientX - div.getBoundingClientRect().x
        this.resizeY = e.clientY - div.getBoundingClientRect().y
        this.resizeW = div.getBoundingClientRect().width
        this.resizeH = div.getBoundingClientRect().height
        window.addEventListener('mousemove',this.resizeMoved)
        window.addEventListener('mouseup',this.resizeReleased)
    }

    resizeMoved = (e) => {
        const width = e.clientX - this.resizeX + this.resizeW
        const height = e.clientY - this.resizeY + this.resizeH
        this.seq.dimension.w = width
        this.seq.dimension.h = height
        this.callback()
    }

    resizeReleased = (e) => {
        window.removeEventListener('mousemove',this.resizeMoved)
        window.removeEventListener('mouseup',this.resizeReleased)
    }

}

class MoveHandler {
    constructor(e, sequence, div, callback) {
        this.sequence = sequence
        this.callback = callback
        this.offsetX = e.clientX - div.getBoundingClientRect().x
        this.offsetY = e.clientY - div.getBoundingClientRect().y
        window.addEventListener('mousemove',this.mouseMoved)
        window.addEventListener('mouseup',this.mouseReleased)
    }

    mouseMoved = (e) => {
        this.sequence.position.x = e.clientX - this.offsetX
        this.sequence.position.y = e.clientY - this.offsetY
        this.callback()
    }
    mouseReleased = (e) => {
        window.removeEventListener('mousemove',this.mouseMoved)
        window.removeEventListener('mouseup',this.mouseReleased)
    }
}

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
            seq:this.props.sequence
        }
    }
    toggleNote = (col, pitch, row) => {
        this.state.seq.instrument.synth.triggerAttackRelease(pitch,'4n')
        this.state.seq.toggleNoteAt(row,col)
        const seq = this.state.seq
        this.setState({seq:this.state.seq})
    }

    mousePressed = (e) => {
        e.stopPropagation()
        new MoveHandler(e,this.props.sequence,this.div,()=>{
            this.setState({seq:this.props.sequence})
        })
    }


    resizePressed = (e) => {
        e.stopPropagation()
        new ResizeHandler(e,this.props.sequence, this.div, ()=>{
            this.setState({seq:this.props.sequence})
        })
    }

    render() {
        console.log("render")
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
                <button onMouseDown={this.resizePressed}>resize</button>
            </div>
            {
                this.renderRows(this.props.sequence)
            }
            <div className={"title"}>{this.props.sequence.title}</div>
        </div>
    }

    renderRows(seq) {
        const rows = []
        for(let i=seq.startPitch; i<seq.startPitch+seq.pitchCount; i++) {
            const pitch = seq.pitches[i]
            rows.push(<SequenceRow key={i}
                                   pitch={pitch}
                                   row={i}
                                   sequence={seq}
                                   onToggleNote={(col)=>this.toggleNote(col,pitch,i)}
                                   column={this.props.column}
            />)
        }
        return rows
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
        this.state = {
            column:0,
            playing:false,
        }
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
                        seq.instrument.synth.triggerAttackRelease(pitch, "8n");
                    }
                })
            })

        }, beats, "8n")
            .start(0)

        // synth.triggerAttackRelease("C4", "8n");
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
