import React, {Component, useState, useContext, useEffect, createContext} from 'react'
import "./gui.css"

export function makeClassNames(map) {
    let classNames = ""
    Object.keys(map).forEach(key=>{
        if(map[key]) classNames+= (" " + key)
    })
    return classNames
}

export const CSS = makeClassNames

export class DialogManager {
    constructor() {
        this.visible = false
        this.listeners = []
    }
    on(cb) {
        this.listeners.push(cb)
    }
    off(cb) {
        this.listeners = this.listeners.filter(c => c !== cb)
    }
    show(content) {
        this.visible = true
        this.content = content
        this.listeners.forEach(cb => cb(this))
    }
    hide() {
        this.target = null
        this.content = null
        this.visible = false
        this.listeners.forEach(cb => cb(this))
    }
}

export const DialogContext = createContext()

export function DialogContainer() {
    const dm = useContext(DialogContext)
    const [visible,setVisible] = useState(false)
    const [content,setContent] = useState(<b>nothing</b>)
    useEffect(()=>{
        const h = (pm) => {
            setVisible(pm.visible)
            setContent(pm.content)
        }
        dm.on(h)
        return ()=>dm.off(h)
    },[dm.visible])
    const css = CSS({
        'dialog-container':true,
        visible:visible
    })
    return <div className={css}>{content}</div>
}

