import React, {Component, useState, useContext, useEffect} from 'react'
export const LOGIN = "LOGIN"

export class DocServerAPI {
    constructor(url) {
        this.url = url
        this.listeners = {}
    }
    on(type, cb) {
        if (!this.listeners[type]) this.listeners[type] = []
        this.listeners[type].push(cb)
    }

    off(type, cb) {
        if (this.listeners[type])
            this.listeners[type] = this.listeners[type].filter(c => c !== cb)
    }
    fire(type, payload) {
        if (!this.listeners[type]) this.listeners[type] = []
        this.listeners[type].forEach(cb => cb(payload))
    }
    isLoggedIn() {
        if (localStorage.getItem('access-token')) return true
        return false
    }
    startLogin() {
        console.log("starting to do the login")
        let auth_url = `${this.url}auth/github/`
        this.win = window.open(auth_url, '_blank')
        window.addEventListener('message', this.authCallback)
        if (this.win) this.win.focus()
    }
    startLogout() {
        localStorage.clear()
        this.fire(LOGIN, {})
    }
    authCallback = (msg) => {
        console.log("got the auth callback", msg.data)
        localStorage.setItem('access-token', msg.data.payload.accessToken)
        localStorage.setItem('username', msg.data.payload.username)
        this.win.close()
        window.removeEventListener('message', this.authCallback)
        this.fire(LOGIN, {})
    }
    getUsername() {
        return localStorage.getItem('username')
    }
    listDocs(filter) {

    }
    saveDoc(doc) {

    }
    loadDoc(id) {

    }
}

export const DocServerContext = React.createContext()

export const LoginButton = ({})=> {
    const ds = useContext(DocServerContext)
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
    if(ds.isLoggedIn()) {
        return <button onClick={()=>ds.startLogout()}>{ds.getUsername()}</button>
    }
    return <button onClick={()=>{
        ds.startLogin()
    }}>login</button>
}
