import React, {Component} from 'react';
import './App.css';
import Tone from "tone"

const sequences = [
    {
        title:'synth',
        position: {
            x:10,
            y:10,
        },
        pitches:['A4','B4','C5','D5'],
        notes:new Array(16),
        instrument:{
            name:'synth1'
        },
    },
    {
        title:'drum',
        position:{
            x:20,
            y:200,
        },
        pitches:['C3','D6'],
        notes:[1,0],
        instrument:{
            name:'drum'
        }
    }
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
        const index = row*16+col
        if(index > this.state.seq.notes.length-1) {
            return false
        }
        return this.state.seq.notes[index]
    }
    toggleNote = (col, pitch, row) => {
        console.log("setting at",col,pitch,row)
        const index = row*16+col
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
                    return <SequenceRow key={i} pitch={pitch} instrument={this.props.instrument}
                                        isNoteSelected={(col)=>this.isNoteSelected(i,col)}
                                        onToggleNote={(col)=>this.toggleNote(col,pitch,i)}
                    />
                })
            }
        </div>
    }
}

class SequenceRow extends Component {
    render() {
        const beats = []
        for(let i=0; i<16; i++) {
            const selected = this.props.isNoteSelected(i)
            beats.push(<SequenceNote key={i} beat={i} row={this} selected={selected}
                                     onClick={()=>{
                                         this.clicked(i)
                                     }}
            />)
        }
        return <div className="sequence-row">{beats}</div>
    }
    clicked(col) {
        console.log("playing",this.props.pitch)
        this.props.instrument.triggerAttackRelease([this.props.pitch],'4n')
        this.props.onToggleNote(col)
    }
}

class SequenceNote extends Component {
    render() {
        return <button
        style={{
            backgroundColor:this.props.selected?'magenta':'white'
        }}
            className="note" onClick={this.props.onClick}></button>
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

    constructor(props, context) {
        super(props, context)
        const synth = new Tone.PolySynth(8, Tone.Synth, {
            "oscillator": {
                "partials": [0, 2, 3, 4]
            }
        }).toMaster()
        this.synth = synth
        const loop = new Tone.Sequence((time, col) => {
            const index =
            console.log("tick")

            sequences.forEach((seq)=>{
                seq.pitches.forEach((pitch,row) => {
                    const index = row * 16 + col
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

        }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "4n")
            .start(0)

        synth.triggerAttackRelease(["C4", "E4", "A4"], "4n");
        Tone.Transport.on("stop", () => {
            console.log("tone trnasport stopped")
        })
        // Tone.Transport.start()
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <button onClick={this.togglePlaying}>play</button>
            <div className="layout-canvas">
                {sequences.map((seq, i) => {
                    return <SequenceView sequence={seq} key={i} instrument={this.synth}/>
                })}
            </div>

            </div>
        );
    }
}

export default App;
