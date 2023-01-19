import React, { useContext, useEffect, useRef, useState } from "react"
import { stateConType } from "../types/types"
import { stateContext } from "./Viewport"

export function Rename () {
    const {projName, setProjName, rename, setRename} = useContext(stateContext)
    const inputRef = useRef<HTMLInputElement>(null)
    
    function f2press (e:KeyboardEvent) {
        if(e.key === "F2"){
            setRename((prev: boolean) => !prev)
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", f2press)
        return(() => {
            document.removeEventListener("keydown", f2press)
        })
    }, [])

    useEffect(() => {
        if(rename && inputRef.current){
            inputRef.current.focus()
            inputRef.current.value = projName
        } else {
            abort()
        }
    }, [rename])

    function abort() {
        setRename(false)
        if(inputRef.current){
            inputRef.current.value = ""
            inputRef.current?.blur()
        }
    }

    function confirm(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault()
        setRename(false)
        if(inputRef.current){
            setProjName(inputRef.current.value)
        }
    }

    return(
        <div className={`renameWrapper ${rename? "active" : ""}`}>
            <span>F2</span>
            <p>Rename project:</p>
            <form onSubmit={confirm}>
                <input type="text" ref={inputRef} defaultValue={projName} placeholder="Enter a name"></input>
                <div className="buttonContainer">
                    <button type="submit" className="confirm" title="Confirm new name">&#10003;</button>
                    <button className="abort" title="Abort and don't change name" onClick={abort}>&times;</button>
                </div>
                
            </form>
            
        </div>
    )
}