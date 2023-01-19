import React, { useContext, useEffect, useRef, useState } from "react"
import { toolType } from "../types/types"
import { scrollHorz } from "./FrequentlyUsedFunctions"
//import "./styles/Bars.css"
//import "./styles/Settings.css"
import { stateContext } from "./Viewport"


export function Vertbar() {
    const {resolution, frontColor, setFrontColor, tool, setTool, setContainerTrans, waiting} = useContext(stateContext)

    const [showSettings, setShowSettings] = useState(false)
    const [settings, setSettings] = useState("")
    const [scroll, setScroll] = useState("")

    const resAvail = useRef<boolean>(false)
    const barRef = useRef<HTMLDivElement>(null)

    function changeFrontColor (e: React.ChangeEvent<HTMLInputElement>) {
        setFrontColor((prev: [string,string])=> [e.target.value, prev[1]])
    }

    function changeBackColor (e: React.ChangeEvent<HTMLInputElement>) {
        setFrontColor((prev: [string,string]) => [prev[0], e.target.value])
    }

    function changeTool (toolName: string) {
        setTool(toolName as toolType)
    }

    useEffect(() => {
        resAvail.current = resolution? true : false
    },[resolution])

    //maybe move key event listener somewhere else: doesnt make much sense here
    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if(resAvail.current && document.activeElement === document.body){ //shortcuts only when there is no focused element
                switch(e.key){
                    case "b":
                        setTool("brush")
                        break
                    case "p":
                        setTool("pipette")
                        break
                    case "e":
                        setTool("eraser")
                        break
                    case "m":
                        setTool("move")
                        break
                    case "c":
                        setContainerTrans([0,0])
                        break
                    case "f":
                        setTool("fill")
                        break
                    case "z":
                        const zoomRange = document.getElementById("zoomRange")
                        if(zoomRange){
                            zoomRange.focus()
                        }
                        break
                    case "1":
                        const firstColor = document.getElementById("firstColor")
                        if(firstColor){
                            firstColor.click()
                        }
                        break
                    case "2":
                        const secondColor = document.getElementById("secondColor")
                        if(secondColor){
                            secondColor.click()
                        }
                        break
                }
            }
        })

        const bar = barRef.current
        if(bar){
            scrollHorz(bar, setScroll)
            bar.addEventListener("scroll", scroll)
        }
        function scroll(){
            scrollHorz(bar, setScroll)
        }
    },[])

    function closeSettings() {
        setShowSettings(false)
        setSettings("")
    }

    function settingsBtn() {
        setShowSettings(prev => !prev)
    }

    return(
        <div className={`vertBar ${scroll}`} ref={barRef}>
            <div className="interactionBar">
                <div className={`toolWrapper ${resolution && !waiting? "" : "unavailable"}`}>
                    <button 
                        className={`btn ${tool === "brush" ? "active" : ""}`} 
                        title="[B] Paintbrush: Paint in the regular style" 
                        onClick={() => changeTool("brush")}
                        >
                        <img className="invert" src="images/selfmade/brush.svg" />
                    </button>

                    <button 
                        className={`btn ${tool === "fill" ? "active" : ""}`} 
                        title="[F] Fill tool (currently only supports areas of up to 10.000px)" 
                        onClick={() => changeTool("fill")}
                        >
                        <img className="invert" src="images/selfmade/fill.svg" />
                    </button>

                    <button 
                        className={`btn ${tool === "pipette" ? "active" : ""}`} 
                        title="[P] Pipette: [Left Mouse]: Primary color, [Right Mouse]: Secondary color" 
                        onClick={() => changeTool("pipette")}
                        >
                        <img className="invert" src="images/selfmade/pipette.svg" />
                    </button>

                    <button 
                        className={`unavailable btn ${tool === "text" ? "active" : ""}`} 
                        title="Text tool" 
                        onClick={() => changeTool("text")}
                        >
                        <img className="invert" src="images/selfmade/text.svg" />
                    </button>

                    <button 
                        className={`btn ${tool === "eraser" ? "active" : ""}`} 
                        title="[E] Eraser: remove color and all opacity" 
                        onClick={() => changeTool("eraser")}
                        >
                        <img className="invert" src="images/selfmade/eraser.svg" />
                    </button>

                    
                </div>

                <div className={`toolWrapper ${resolution && !waiting? "" : "unavailable"}`}>
                    <button
                        className={`btn ${tool === "move" ? "active" : ""}`} 
                        title="[M] [Wheel press] Move the canvas"
                        onClick={() => changeTool("move")}
                        >
                        <img className="invert" src="images/selfmade/move.svg"></img>
                    </button>
                </div>
                
                <div className="colorWrapper">
                    <input type="color" id="firstColor" title="[1] Primary color" className={tool && (tool === "brush" || tool === "fill")? "active" : ""} value={frontColor[0]} onChange={changeFrontColor} />
                    <input type="color" id="secondColor" title="[2] Secondary/background color" className={tool && tool === "eraser"? "active" : ""} value={frontColor[1]} onChange={changeBackColor} />
                </div>
                
            </div>
            <div className="vertBarBottom">
                <button className="aspectCube btn" title="Settings" onClick={settingsBtn}>
                    <img className={`invert ${showSettings? "rotateSetting" : ""}`} src="images/selfmade/Settings.svg" />
                </button>
                <a href="https://www.jfgoldbach.de" target="_blank" className="copy">
                    <small>&copy; 2022/23</small>
                    <small>Julian</small>
                    <small>Goldbach</small>
                </a>
            </div>
            
            {showSettings &&
                <div className="prompt settingsWindow fadeIn">
                    <div className="settingsTop">
                        <h2>Settings</h2>
                        <button className="closeBtn" onClick={closeSettings}>&times;</button>
                    </div>
                    <div className="settingsBottom">
                        <div className="settingsSidebar">
                            <button 
                                className={`settingsBtn ${settings === "proj"? "active" : ""}`} 
                                onClick={() => setSettings("proj")}>Project settings
                            </button>
                            <button 
                                className={`settingsBtn ${settings === "defaults"? "active" : ""}`} 
                                onClick={() => setSettings("defaults")}>Default values
                            </button>
                            <button 
                                className={`settingsBtn ${settings === "storage"? "active" : ""}`} 
                                onClick={() => setSettings("storage")}>Storage
                            </button>
                            <button 
                                className={`settingsBtn ${settings === "zoom"? "active" : ""}`} 
                                onClick={() => setSettings("zoom")}>Zoom
                            </button>
                            <button 
                                className={`settingsBtn ${settings === "rendering"? "active" : ""}`} 
                                onClick={() => setSettings("rendering")}>Rendering
                            </button>
                            <button 
                                className={`settingsBtn ${settings === "lang"? "active" : ""}`} 
                                onClick={() => setSettings("lang")}>Language
                            </button>
                        </div>
                        <div className="settingsMain">
                            <p>Settings will come in the future</p>
                        </div>
                    </div>
                </div>
            }
            
        </div>
    )
}