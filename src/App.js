import React, {Component} from 'react';
import './App.css';

const sequences = [
    {
        position: {
            x:10,
            y:10,
        },
        pitches:['A1','B1','C1','D1'],
        instrument:{
            name:'synth1'
        },
    },
    {
        position:{
            x:20,
            y:200,
        },
        pitches:['D1'],
        instrument:{
            name:'drum'
        }
    }
]

class SequenceView extends Component {
    render() {
        return <div className="sequence-view" style={{
            position:'absolute',
            left:this.props.sequence.position.x,
            top:this.props.sequence.position.y,
        }}>
            {
                this.props.sequence.pitches.map((i)=>{
                    return <SequenceRow key={i}/>
                })
            }
        </div>
    }
}

class SequenceRow extends Component {
    render() {
        const beats = []
        for(let i=0; i<16; i++) {
            beats.push(<SequenceNote key={i} beat={i}/>)
        }
        return <div className="sequence-row">{beats}</div>
    }
}

class SequenceNote extends Component {
    render() {
        return <button className="note"></button>
    }
}

function App() {
  return (
    <div className="layout-canvas">
        {sequences.map((seq,i)=>{
            return <SequenceView sequence={seq} key={i}/>
        })}
    </div>
  );
}

export default App;
