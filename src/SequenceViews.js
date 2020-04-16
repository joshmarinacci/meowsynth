import React, {Component} from 'react'
import {MoveHandler} from './MoveHandler.js'
import {ResizeHandler} from './ResizeHandler.js'

export class SequenceView extends Component {
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
