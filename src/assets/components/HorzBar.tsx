import React, { useContext, useEffect, useRef, useState } from "react"
import { eraseStyleType } from "../types/types"
import { DownloadSave } from "./DownloadSave"
import { heightForFill, scrollHorz } from "./FrequentlyUsedFunctions"
//import "./styles/Bars.css"
import { stateContext } from "./Viewport"


type lastSizeType = {
    eraser: number,
    brush: number
}

export function HorzBar() {
    const {setMessage, resolution, brushSize, setBrushSize, 
        brushOpacity, setBrushOpacity, zoom, setZoom, tool, 
        eraseType, setEraseType, setContainerTrans, 
        containerTrans, undoPos, setUndoPos} = useContext(stateContext)

    const [lastSize, setLastSize] = useState<lastSizeType>({"eraser": brushSize*1.5, "brush": brushSize})
    const [scroll, setScroll] = useState("")

    const barRef = useRef<HTMLDivElement>(null)


    function changeSize (e: React.ChangeEvent<HTMLInputElement>) {
        const value = parseInt(e.currentTarget.value)
        if(value > 0){
            setBrushSize(value)
        } else {
            setBrushSize(0)
        }
    }

    //event listener
    useEffect(() => {
        const bar = barRef.current
        if(bar){
            scrollHorz(bar, setScroll)
            bar.addEventListener("scroll", scroll)
        }
        function scroll(){
            scrollHorz(bar, setScroll)
        }
    }, [])

    //saving the brushsize to tool type
    useEffect(() => {
        const brushWidth = typeof brushSize === "number"? brushSize : parseFloat(brushSize)
        switch(tool){
            case "eraser":
                setLastSize({"eraser": brushWidth, "brush": lastSize.brush})
                break
            case "brush":
                setLastSize({"eraser": lastSize.eraser, "brush": brushWidth})
        }
    }, [brushSize])

    //loading last brushsize on tool change
    useEffect(() => {
        switch(tool){
            case "eraser":
                setBrushSize(lastSize.eraser)
                break
            case "brush":
                setBrushSize(lastSize.brush)
        }
    }, [tool])



    function changeOpacity (e: React.ChangeEvent<HTMLInputElement>) {
        setBrushOpacity(parseFloat(e.target.value))
    }


    function changeZoomType (e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value
        if(value === "original"){
            const wrapper = document.getElementById("canvasWrapper")
            if(wrapper && resolution){
                setZoom([Math.round((resolution[1] * 1000) / wrapper.clientHeight)/10, "original"])
            }

        } else if(value === "fill" && resolution){
            //implement zoom fill checks here!! (so that the zoom value will be set without the useEffect entering an infinite loop)
            setZoom([heightForFill(resolution[1]), "fill"])

        } else if(typeof(parseInt(e.target.value.replace("%", ""))) === "number") {
            switch(value){
                default:
                    setZoom(["", value])
                case "300":
                case "400":
                case "500":
                case "1000":
                    setZoom([parseInt(value), value])
            }
        }
    }


    function changeZoomPercent (e: React.ChangeEvent<HTMLInputElement>) {
        setZoom([e.target.value, "-"])
    }

    function changeEraseType (e: React.ChangeEvent<HTMLSelectElement>) {
        setEraseType(e.target.value as eraseStyleType)
    }

    function resetTransform () {
        setContainerTrans([0, 0])
        setMessage(["Centered canvas", "info"])
    }

    const firstBarVisible = ["eraser", "brush"] //all tools where the first toolbar should be visible

    function undo() {
        if(undoPos > 0){
            setUndoPos((prev: number) => prev - 1)
        }
    }

    function redo() {
        setUndoPos((prev: number) => prev + 1) //validity has to be checked elsewhere (like in canvas.tsx)!
    }



    return(
        <div ref={barRef} className={`horzBar ${scroll}`}>

            <DownloadSave />
            
            <div className="sliderBar">
            {tool === "fill" &&
                <div className="simpleOption">
                    <img src="images/selfmade/fill_colored.svg"></img>
                    <select>
                        <option value="flood" title="Changes pixel to front color that are connected to the clicked pixel by the same color.">Flood fill</option>
                        <option value="replace" title="Replaces every pixel with the same color as the cliked pixel with the front color.">Replace color</option>
                    </select>
                </div>
            }

            {tool && firstBarVisible.indexOf(tool) !== -1 &&
                <div className={`interactionBar ${resolution? "" : "unavailable"}`}>
                    {tool && tool === "eraser" &&
                        <div className="simpleOption" title="Change eraser type from using the secondary color to drawing transparency">
                            <img src="images/selfmade/eraser_colored.svg"></img>
                            <select value={eraseType} onChange={changeEraseType}>
                                <option value="transparent">Transparent</option>
                                <option value="secondary">Secondary color</option>
                            </select>
                        </div>
                    }

                    {tool && (tool === "eraser" || tool === "brush") &&
                        <div className="scaleInfo" title="Change the size of the brush">
                            <div className="horzFlexBetween">
                                <p>Size:</p>
                                <input type="number" min={1} max={16384} value={brushSize} onChange={changeSize} />
                                <p>px</p>
                            </div>
                            <input type="range" min={1} max={128} step={1} value={brushSize} onChange={changeSize}  />
                        </div>
                    }

                    {tool && (tool === "eraser" || tool === "brush") &&
                        <div className="scaleInfo" title="(Not fully developed yet!) Change how intense the color should overlap">
                            <div className="horzFlexBetween">
                                <p>Opacity:</p>
                                <input type="number" min={0} max={100} value={brushOpacity} onChange={changeOpacity} />
                                <p>%</p>
                            </div>
                            <input type="range" min={0} max={100} step={0.1} value={brushOpacity} onChange={changeOpacity} />
                        </div>
                    }
                </div>
            }

            <div className={`moreOptions ${resolution? "" : "unavailable"}`}>
                <div className="zoomInfo" title="[Z] Canvas size (percentage based on viewport height)">
                    <div className="horzFlexBetween">
                        <img src="images/selfmade/zoom.svg" className="infoIcon" />
                        <div className="zoomPercent">
                            <input type="number" min={0} value={zoom[0]? zoom[0] : ""} onChange={changeZoomPercent} />
                            <p>%</p>
                        </div>
                        <select value={zoom[1]} onChange={changeZoomType} >
                            <option value="-">-</option>
                            <option title="Matches this screens pixel size (dependent on resolution)" value="original">Original</option>
                            <option title="Fills the most possible space without overlapping the toolbars (currently set to: 99%)" value="fill">Fill screen</option>
                            <option value="300">300%</option>
                            <option value="400">400%</option>
                            <option value="500">500%</option>
                            <option value="1000">1000%</option>
                        </select>
                    </div>
                    <input id="zoomRange" type="range" min={1} max={200} step={1} value={zoom[0]} onChange={changeZoomPercent}  />
                </div>
                
            </div>

            {!(containerTrans[0] === 0 && containerTrans[1] === 0) &&
                <div className="horzFlexBetween">
                        <button className="mediumBtn scaleFadeIn btn" onClick={resetTransform}>
                            <img title={`[C] Center canvas. Current translation: (${containerTrans[0]}px, ${containerTrans[1]}px)`} className="invert" src="images/selfmade/center.svg"></img>
                        </button>   
                </div>
            }

            <div className="horzFlexBetween moreOptions unavailable">
                <button onClick={undo} className="btn timetravel" title="Undo (remove last action from canvas)">
                    <img src="images/selfmade/undo.svg" className="invert" />
                    <p>0</p>
                </button>
                <button onClick={redo} className="btn timetravel" title="Redo (add back last removed action to canvas)">
                    <img src="images/selfmade/redo.svg" className="invert" />
                    <p>0</p>
                </button>
            </div>
            </div>

            <h1>
                
                PenShift
                <img src="images/selfmade/penshift_symbol_light.svg"></img>
            </h1>
        </div>
    )
}