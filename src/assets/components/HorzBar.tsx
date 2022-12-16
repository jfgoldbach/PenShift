import { useContext, useEffect, useState } from "react"
import "./styles/Bars.css"
import { stateContext } from "./Viewport"


type lastSizeType = {
    eraser: number,
    brush: number
}

export function HorzBar() {
    const {setMessage, resolution, brushSize, setBrushSize, brushOpacity, setBrushOpacity, zoom, setZoom, tool, eraseType, setEraseType, setContainerTrans, containerTrans, projName} = useContext(stateContext)

    const [download, setDownload] = useState<string>()
    const [lastSize, setLastSize] = useState<lastSizeType>({"eraser": brushSize*1.5, "brush": brushSize})

    function changeSize (e) {
        if(e.target.value > 0){
            setBrushSize(e.target.value)
        } else {
            setBrushSize(0)
        }
    }

    //saving the brushsize to tool type
    useEffect(() => {
        switch(tool){
            case "eraser":
                setLastSize({"eraser": parseInt(brushSize), "brush": lastSize.brush})
                break
            case "brush":
                setLastSize({"eraser": lastSize.eraser, "brush": parseInt(brushSize)})
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



    function changeOpacity (e) {
        setBrushOpacity(e.target.value)
    }

    function changeZoomType (e) {
        if(e.target.value === "original"){
            const wrapper = document.getElementById("canvasWrapper")
            if(wrapper){
                setZoom([Math.round((resolution[1] * 1000) / wrapper.clientHeight)/10, "original"])
            }
        } else {
            const value = e.target.value
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

    function changeZoomPercent (e) {
        setZoom([e.target.value, "-"])
    }

    function changeEraseType (e) {
        setEraseType(e.target.value)
    }

    function resetTransform () {
        setContainerTrans([0, 0])
        setMessage(["Centered canvas", "info"])
    }

    function genDownload () {
        const canvas: HTMLCanvasElement = document.getElementById("canvas")
        if(canvas){
            //dirty, but it works: creates a new anchor element with the converted image as download and clicks it
            const img = canvas.toDataURL("image/png")
            const dwn = document.createElement('a')
            dwn.href = img
            dwn.download = `${projName !== "" ? projName : "image"}`
            dwn.click()
            dwn.remove()
        } else {
            window.alert("Error: canvas not found")
        }
    }

    const firstBarVisible = ["eraser", "brush"]



    return(
        <div className="horzBar">
            <button className={`saveBtn aspectCube ${resolution ? "" : "unavailable"}`} onClick={genDownload} title={`Save "${projName !== "" ? projName : "image"}.png"`}>
                {/*resolution &&
                    <div className="dwnImgContainer">
                        <img id="saveImg" className="saveImg" src="/" />
                    </div>
    */}
                <img className="invert" src="images/selfmade/save2.svg" />
            </button>

            <div className="sliderBar">
            {firstBarVisible.filter(i => i === tool).length !== 0 &&
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

            <div className={`horzFlexBetween moreOptions ${resolution? "" : "unavailable"}`}>
                <div className="zoomInfo" title="[Z] Change how large the canvas is displayed">
                    <div className="horzFlexBetween">
                        <img src="images/selfmade/zoom.svg" className="infoIcon" />
                        <div className="zoomPercent">
                            <input type="number" min={0} value={zoom[0]? zoom[0] : ""} onChange={changeZoomPercent} />
                            <p>%</p>
                        </div>
                        <select value={zoom[1]} onChange={changeZoomType} >
                            <option value="-">-</option>
                            <option title="Matches this screens pixel size (dependent on resolution)" value="original">Original &#40;unscaled&#41;</option>
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
                        <button className="mediumBtn scaleFadeIn" onClick={resetTransform}>
                            <img title={`[C] Center canvas. Current translation: (${containerTrans[0]}px, ${containerTrans[1]}px)`} className="invert" src="images/selfmade/center.svg"></img>
                        </button>   
                </div>
            }

            <div className="horzFlexBetween unavailable moreOptions">
                <button title="Undo (remove last action from canvas)">
                    <img src="images/selfmade/undo.svg" className="invert" />
                </button>
                <button title="Redo (add back last removed action to canvas)">
                    <img src="images/selfmade/redo.svg" className="invert" />
                </button>
            </div>
            </div>

            <h1>🖌 PenShift</h1>
        </div>
    )
}