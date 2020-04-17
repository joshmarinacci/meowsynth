import React, {Component, useContext, useState, useEffect} from 'react'
import './App.css'
import Tone from "tone"
import {} from "./SequenceViews"
import {Sequence, SEQUENCE_LENGTH} from './sequence.js'
import {SequenceView} from './SequenceViews.js'
import {DocServerAPI, DocServerContext, LOGIN, LoginButton} from "./docserver.js"
import {DialogContainer, DialogContext, DialogManager} from './gui.js'

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


const SaveButton = ({doc, onSave})=>{
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
        ds.save(doc).then((res)=>{
            console.log("saved with the result",res);
            onSave(res)
        })
    }
    if(ds.isLoggedIn()) {
        return <button onClick={doSave}>save</button>
    } else {
        return <button disabled>save</button>
    }
}

const LoadFileButton = ({file, onLoad})=>{
    let dm = useContext(DialogContext)
    let ds = useContext(DocServerContext)
    const doLoad = () =>
        ds.load(file._id).then(new_doc => {
            console.log("the new doc is",new_doc)
            new_doc.sequences = new_doc.sequences.map(seq => {
                return Sequence.fromJSONObject(seq,SYNTHS)
            })
            new_doc.docid = file._id
            dm.hide()
            onLoad(new_doc)
        }
    )
    return <button style={{
        padding:'1em'
    }} onClick={doLoad}>{file.title}</button>
}
const DeleteFileButton = ({file}) => {
    let ds = useContext(DocServerContext)
    const doDelete = () => ds.delete(file._id)
    return <button onClick={doDelete}>delete</button>
}
const OpenDocDialog = ({onLoad})=>{
    let dm = useContext(DialogContext)
    let ds = useContext(DocServerContext)
    let [files, setFiles] = useState([])
    let [loaded,setLoaded] = useState(false)
    useEffect(()=>{
        if(!loaded) {
            setLoaded(true)
            ds.list("meowsynth").then(r => {
                console.log("got the files", r.results)
                setFiles(r.results)
            })
        }
    })
    return <div className="dialog">
        <header>open a file</header>
        <div className="body">{
            files.map(file => {
                return <div key={file._id}>
                    <LoadFileButton file={file} onLoad={onLoad}/>
                    <DeleteFileButton file={file}/>
                </div>
            })
        }
        </div>
        <footer>
            <button onClick={()=>dm.hide()}>dismiss</button>
        </footer>
    </div>
}
const LoadButton = ({docid, onLoad}) => {
    let ds = useContext(DocServerContext)
    let dm = useContext(DialogContext)
    if(!ds.isLoggedIn()) {
        return <button disabled>load</button>
    }

    const doLoad = () => dm.show(<OpenDocDialog onLoad={onLoad}/>)
    return <button onClick={doLoad}>load</button>


}

function generateDefaultDoc() {
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
                synthkey:'kalimba',
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
                synthkey:'base',
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
                synthkey:'slap',
                synth: SYNTHS.slap
            }
        })
    ]
    return {
        title:'new synth doc',
        sequences:sequences,
    }
}

class SequenceApp extends Component {
    togglePlaying = () => {
        Tone.Transport.toggle()
    }
    clearBoard = () => {
        this.state.doc.sequences.forEach(seq => seq.clear())
        this.setState({column:0})
    }
    fillBoard = () => {
        this.state.doc.sequences.forEach(seq => seq.fill())
        this.setState({column:0})
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            column:0,
            playing:false,
        }
        if(!this.state.doc) {
            this.state.doc = generateDefaultDoc()
        }
        const beats = []
        for(let i=0; i<SEQUENCE_LENGTH; i++) beats.push(i)
        const loop = new Tone.Sequence((time) => {
            this.state.doc.sequences.forEach((seq)=>{
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

    render() {
        return (
                <div>
                    <div className="layout-canvas">
                        {this.state.doc.sequences.map((seq, i) => {
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
                        <label>{this.state.doc.title}</label>
                        <label>id={this.state.doc.docid}=</label>
                        <SaveButton doc={this.state.doc} onSave={(res)=>{
                            console.log('saved with this result',res)
                            if(res.doc && res.doc._id) {
                                console.log("new docid is",res.doc._id)
                                this.state.doc.docid = res.doc._id
                                this.setState({doc:this.state.doc})
                            }
                        }}/>
                        <LoadButton onLoad={doc=> this.setState({doc:doc}) }/>
                        <LoginButton/>
                    </div>
                    <div className={"toolbar hbox"}>
                        <label>title</label>
                        <input type="text" value={this.state.doc.title}
                               onChange={e => {
                                   this.state.doc.title = e.target.value
                                   this.setState({doc:this.state.doc})
                               }}
                        />
                    </div>
                    <DialogContainer/>
                </div>
        );
    }
}

export const App = ({})=>{
    let [docserver] = useState(()=>new DocServerAPI("https://docs.josh.earth/"))
    return <DocServerContext.Provider value={docserver}>
    <DialogContext.Provider value={new DialogManager()}>
        <SequenceApp/>
    </DialogContext.Provider>
    </DocServerContext.Provider>
}
export default App;
