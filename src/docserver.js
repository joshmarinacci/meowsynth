import React, {Component, useState, useContext} from 'react'

export class DocServerAPI {
    constructor(url) {
        this.url = url
    }
    isLoggedIn() {
        return false
    }
    startLogin() {
        console.log("starting to do the login")
    }
    getUsername() {
        return "dummy username"
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
    if(ds.isLoggedIn()) {
        return <button>{ds.getUsername()}</button>
    }
    return <button onClick={()=>{
        ds.startLogin()
    }}>login</button>
}
