import React, { createContext, useEffect, useState } from "react"
import { Canvas } from "./Canvas"
import { HorzBar } from "./HorzBar"
import { Message } from "./Message"
import "./styles/Viewport.css"
import { Vertbar } from "./VertBar"

type stateConType = {
    frontColor: [string, string],
    setFrontColor: React.Dispatch<React.SetStateAction<[string, string]>>,
    brushSize: number,
    setBrushSize: React.Dispatch<React.SetStateAction<number>>,
    brushOpacity: number,
    setBrushOpacity: React.Dispatch<React.SetStateAction<number>>,
    zoom: [number | string, string],
    setZoom: React.Dispatch<React.SetStateAction<[number | string, string]>>,
    tool: toolType | undefined,
    setTool: React.Dispatch<React.SetStateAction<toolType | undefined>>,
    projName: string,
    setProjName: React.Dispatch<React.SetStateAction<string>>,
    eraseType: eraseStyleType,
    setEraseType: React.Dispatch<React.SetStateAction<eraseStyleType>>,
    containerTrans: [number, number],
    setContainerTrans: React.Dispatch<React.SetStateAction<[number, number]>>,
    resolution: [number,number]|undefined,
    setResoultion: React.Dispatch<React.SetStateAction<[number,number]|undefined>>,
    message: messageType|undefined,
    setMessage: React.Dispatch<React.SetStateAction<messageType|undefined>>

} 
| undefined

export type toolType = "brush" | "eraser" | "pipette" | "move" | "fill" | "text"

export type eraseStyleType = "secondary" | "transparent"

type messageType = [string, "info" | "alert"]

export const stateContext = createContext<stateConType>(undefined)

export function Viewport () {
    const [frontColor, setFrontColor] = useState<[string,string]>(["#000000", "#fbfaff"]) //rgb(0,64,128)
    const [brushSize, setBrushSize] = useState(20)
    const [brushOpacity, setBrushOpacity] = useState(100)
    const [zoom, setZoom] = useState<[number|string, string]>(["", "-"])
    const [tool, setTool] = useState<toolType>()
    const [projName, setProjName] = useState("")
    const [eraseType, setEraseType] = useState<eraseStyleType>("secondary")
    const [containerTrans, setContainerTrans] = useState<[number,number]>([0,0])
    const [resolution, setResolution] = useState<[number,number]>()
    const [message, setMessage] = useState<messageType>() //maybe could implement message stack

    useEffect(() => {
        document.documentElement.style.setProperty("--mobileHeight", `${window.innerHeight}px`)
    })

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
        message, setMessage
    }
    

    return(
        <stateContext.Provider value={context}>
            <div className="viewport">
                <HorzBar />
                <div className="secondPart">
                    <Vertbar />
                    <Canvas/>
                </div>
            </div>
        </stateContext.Provider>
    )
}