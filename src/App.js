import React, {Component, useContext, useState, useEffect} from 'react'
import './App.css'
import Tone from "tone"
import {ResizeHandler} from './ResizeHandler'
import {MoveHandler} from './MoveHandler'
import {} from "./SequenceViews"
import {Sequence, SEQUENCE_LENGTH} from './sequence.js'
import {SequenceView} from './SequenceViews.js'
import {DocServerAPI, DocServerContext, LOGIN, LoginButton} from "./docserver.js"

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
        position:{ x:10, y:200, },
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
        position: {  x:10,  y:400, },
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

const SaveButton = ({doc})=>{
    let ds = useContext(DocServerContext)
    const [li, setLi] = useState(ds.isLoggedIn())
    useEffect(()=>{
        let cb = () => {
            console.log('login changed')
            setLi(ds.isLoggedIn())
        }
        ds.on(LOGIN,cb)
        return () => {
            console.log('rebuilding')
            ds.off(LOGIN,cb)
        }
    },li)
    const doSave = () => {
        console.log('really saving the doc',doc)
    }
    if(ds.isLoggedIn()) {
        return <button onClick={doSave}>save</button>
    } else {
        return <button disabled>save</button>
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
        this.docserver = new DocServerAPI("https://docs.josh.earth/")
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
            <DocServerContext.Provider value={this.docserver}>
                <div>
                    <div className="layout-canvas">
                        {sequences.map((seq, i) => {
                            return <SequenceView sequence={seq}
                                                 key={i}
                                                 instrument={this.synth}
                                                 column={this.state.column}/>
                        })}
                    </div>
                    <div className={"toolbar hbox"}>
                        <button onClick={this.togglePlaying}>
                            {this.state.playing?"stop":"start"}
                        </button>
                        <button onClick={this.clearBoard}>
                            clear
                        </button>
                        <button onClick={this.fillBoard}>
                            BBEE AA SSAAVVAAGGEE!!!!!!
                        </button>
                        <span className={"spacer"}>spacer</span>
                        <SaveButton doc={sequences}/>
                        <LoginButton/>
                    </div>
                </div>
            </DocServerContext.Provider>
        );
    }
}

export default App;
