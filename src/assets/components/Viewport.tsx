import React, { createContext, useEffect, useState } from "react"
import { eraseStyleType, messageType, stateConType, toolType } from "../types/types"
import { Canvas } from "./Canvas"
import { DownloadSave } from "./DownloadSave"
import { HorzBar } from "./HorzBar"
import { Rename } from "./Rename"
//import "./styles/Viewport.css"
import { Vertbar } from "./VertBar"



export const stateContext = createContext<stateConType>({} as stateConType)

export function Viewport () {
    const [frontColor, setFrontColor] = useState<[string,string]>(["#000000", "#fbfaff"])
    const [brushSize, setBrushSize] = useState(8)
    const [brushOpacity, setBrushOpacity] = useState(100)
    const [zoom, setZoom] = useState<[number, string]>([99, "-"])
    const [tool, setTool] = useState<toolType>()
    const [projName, setProjName] = useState("")
    const [eraseType, setEraseType] = useState<eraseStyleType>("secondary")
    const [containerTrans, setContainerTrans] = useState<[number,number]>([0,0])
    const [resolution, setResolution] = useState<[number,number]>()
    const [message, setMessage] = useState<messageType>()   //<-- obsolete (maybe could implement message stack)
    const [waiting, setWaiting] = useState(false)           //<-- obsolete
    const [undoPos, setUndoPos] = useState<number>(0)
    const [rename, setRename] = useState(false)


    useEffect(() => {
        function setHeight () {
            document.documentElement.style.setProperty("--mobileHeight", `${window.innerHeight}px`)
        }
        setHeight()
    }, [])

    useEffect(() => {
        const title = document.getElementById("documentTitle")
        if(title && projName!== ""){
            title.innerHTML = `${projName} - PenShift`
        }
    },[projName])

    const context = {
        frontColor, setFrontColor, 
        brushSize, setBrushSize, 
        brushOpacity, setBrushOpacity, 
        zoom, setZoom,
        tool, setTool,
        projName, setProjName,
        eraseType, setEraseType,
        containerTrans, setContainerTrans,
        resolution, setResolution,
        message, setMessage,
        undoPos, setUndoPos,
        waiting, setWaiting,
        rename, setRename
    } as stateConType
    

    return(
        <stateContext.Provider value={context}>
            <div className="viewport">
                <div className="firstPart">
                    <DownloadSave />
                    <HorzBar />
                </div>
                <div className="secondPart">
                    <Vertbar />
                    <Canvas/>
                    <Rename />
                </div>
            </div>
        </stateContext.Provider>
    )
}