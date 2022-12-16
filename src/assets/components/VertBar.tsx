import { useContext, useEffect, useRef } from "react"
import "./styles/Bars.css"
import { stateContext } from "./Viewport"


export function Vertbar() {
    const {resolution, frontColor, setFrontColor, tool, setTool, eraseType, setEraseType, setContainerTrans} = useContext(stateContext)

    const resAvail = useRef<boolean>(false)

    function changeFrontColor (e) {
        setFrontColor(prev => [e.target.value, prev[1]])
    }

    function changeBackColor (e) {
        setFrontColor(prev => [prev[0], e.target.value])
    }

    function changeTool (toolName) {
        setTool(toolName)
    }

    useEffect(() => {
        resAvail.current = resolution? true : false
    },[resolution])

    //maybe move key event listener somewhere else: doesnt make much sense here
    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if(resAvail.current){
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
    },[])

    return(
        <div className="vertBar">
            <div className="interactionBar">
                <div className={`toolWrapper ${resolution? "" : "unavailable"}`}>
                    <button 
                        className={tool === "brush" ? "active" : ""} 
                        title="[B] Paintbrush: Paint in the regular style" 
                        onClick={() => changeTool("brush")}
                        >
                        <img className="invert" src="images/selfmade/brush.svg" />
                    </button>

                    <button 
                        className={tool === "fill" ? "active" : ""} 
                        title="[F] Fill tool (currently only supports areas of up to 10.000px)" 
                        onClick={() => changeTool("fill")}
                        >
                        <img className="invert" src="images/selfmade/fill.svg" />
                    </button>

                    <button 
                        className={tool === "pipette" ? "active" : ""} 
                        title="[P] Pipette: [Left Mouse]: Primary color, [Right Mouse]: Secondary color" 
                        onClick={() => changeTool("pipette")}
                        >
                        <img className="invert" src="images/selfmade/pipette.svg" />
                    </button>

                    <button 
                        className={`unavailable ${tool === "text" ? "active" : ""}`} 
                        title="Text tool" 
                        onClick={() => changeTool("text")}
                        >
                        <img className="invert" src="images/selfmade/text.svg" />
                    </button>

                    <button 
                        className={tool === "eraser" ? "active" : ""} 
                        title="[E] Eraser: remove color and all opacity" 
                        onClick={() => changeTool("eraser")}
                        >
                        <img className="invert" src="images/selfmade/eraser.svg" />
                    </button>

                    
                </div>

                <div className={`toolWrapper ${resolution? "" : "unavailable"}`}>
                <button
                        className={tool === "move" ? "active" : ""} 
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
            <div className="vertBarButtom">
                <button className="aspectCube" title="Settings">
                    <img className="invert" src="images/selfmade/Settings.svg" />
                </button>
                <a href="https://www.jfgoldbach.de" target="_blank" className="copy">
                    <small>&copy; 2022</small>
                    <small>Julian</small>
                    <small>Goldbach</small>
                </a>
            </div>
            
            
        </div>
    )
}