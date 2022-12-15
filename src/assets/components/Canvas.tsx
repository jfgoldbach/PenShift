import { useRef, useEffect, useState, useContext } from "react"
import { ResolutionPreset } from "./ResolutionPreset"
import "./styles/Canvas.css"
import { stateContext, toolType } from "./Viewport"


type rgbColor = [r:number, g:number, b:number]

//its getting messy: outsource more code to their own components

export function Canvas() {
    const {resolution, brushOpacity, setResolution, frontColor, setFrontColor, brushSize, zoom, setZoom, tool, setTool, projName, setProjName, eraseType, containerTrans, setContainerTrans} = useContext(stateContext)

    const canvasRef = useRef<HTMLCanvasElement>()
    const undoCanvasRef = useRef<HTMLCanvasElement>()
    const paintVisRef = useRef<HTMLCanvasElement>()
    const canvasContainerRef = useRef<HTMLDivElement>()
    const wrapperRef = useRef<HTMLDivElement>()
    const resX = useRef<HTMLInputElement>()
    const resY = useRef<HTMLInputElement>()

    const [back, setBack] = useState(true)
    const [preset, setPreset] = useState("Widescreen")
    const [inzoom, setInzoom] = useState(false)
    //const [containerTrans, setContainerTrans] = useState<[number,number]>([0,0])
    const [pickedColor, setPickedColor] = useState<string>()
    const [previewImg, setPreviewImg] = useState<string>()

    const mousedown = useRef(false)
    const lastPos = useRef<[number, number]>() //is used for drawing and moving the canvas
    const pickedColorRef = useRef<string>()
    const eraserTypeRef = useRef<string>()
    const brushSizeRef = useRef<number>()
    const brushOpacityRef = useRef<number>()
    const size = useRef<number>()
    const color = useRef<string>()
    const curTool = useRef<toolType>()
    const containerTransRef = useRef<[number,number]>([0,0])
    const zoomRef = useRef<number>()


    function numberToHex (n:number){
        return n.toString(16).padStart(2,"0")
    }
    
    function rgbToHex (r:number ,g:number ,b:number) {
        return(`#${numberToHex(r)}${numberToHex(g)}${numberToHex(b)}`)
    }


    //update pipette overlay
    useEffect(() => {
        pickedColorRef.current = pickedColor
        if(paintVisRef.current && curTool.current === "pipette"){
            const context = paintVisRef.current.getContext("2d")
            if(context && pickedColor){
                context.clearRect(0,0,200,200)

                context.fillStyle = "white"
                context.fillRect(41,25, 118, 30)
                context.fillStyle = "rgba(0,0,0,0.4)"
                context.fillRect(41,55, 118, 1)

                context.strokeStyle = "rgba(0,0,0,0.4)"
                context.lineWidth = 22
                context.beginPath()
                context.arc(100, 100, 85, 0, Math.PI*2, true)
                context.stroke() 
                
                if(pickedColor){
                    context.strokeStyle = pickedColor
                }
                context.lineWidth = 20
                context.beginPath()
                context.arc(100, 100, 85, 0, Math.PI*2, true)
                context.stroke()

                context.fillStyle = "black"
                context.font = "20px sans-serif";
                context.textAlign = "center"
                context.fillText(pickedColor, 100, 52);
            }
        }
    }, [pickedColor, tool])


    useEffect(() => {
        const container = canvasContainerRef.current
        if(container){
            container.style.transform = `translate(${containerTrans[0]}px, ${containerTrans[1]}px)`
            containerTransRef.current = containerTrans
        }
        if(!(containerTrans[0] === 0 && containerTrans[1] === 0)){
            setZoom
        }
    }, [containerTrans])

    useEffect(() => {
        eraserTypeRef.current = eraseType
    }, [eraseType])

    useEffect(() => {
        brushSizeRef.current = brushSize
    }, [brushSize])

    useEffect(() => {
        curTool.current = tool
        if(tool !== "pipette"){
            setPickedColor(undefined)
        }
        updatePaintVisSize()
    }, [tool, eraseType])

    useEffect(() => {
        size.current = brushSize
        updatePaintVisSize()
    }, [brushSize])

    useEffect(() => {
        brushOpacityRef.current = brushOpacity
    }, [brushOpacity])

    useEffect(() => {
        color.current = frontColor
    }, [frontColor])

    //event listeners
    useEffect(() => {
        document.addEventListener("mousedown", (e) => {
            if(e.target === wrapperRef.current || e.target === canvasRef.current){
                actionOnClick(e)
                mousedown.current = true
            }
        })
        document.addEventListener("mouseup", () => {
            lastPos.current = undefined
            mousedown.current = false
            updatePreviewImg()
        })
        document.addEventListener("mousemove", (e) => {
            if(e.target === wrapperRef.current || e.target === canvasRef.current){
                if(mousedown.current){
                    actionOnClick(e)
                }

                if(paintVisRef.current){
                    movePaintVis(e)
                }

                if(curTool.current === "pipette"){
                    updatePipette(e)
                }
            }
        })
        document.addEventListener("contextmenu", (e) => { //prevents contextmenu
            e.preventDefault()
        })
    }, [])

    useEffect(() => {
        if(zoom[1]){
            switch(zoom[1]){
                case "fill":
                    zoomFillScreen()
                    setContainerTrans([0,0])
                    break
                case "original":
                    zoomOriginal()
                    setContainerTrans([0,0])
                    break
            }
        }
        if(zoom[0] && canvasContainerRef.current && resolution && wrapperRef.current){
            canvasContainerRef.current.style.height = zoom[0] + "%"
            canvasContainerRef.current.style.width = `${wrapperRef.current.clientHeight * (zoom[0]/100) * (resolution[0]/resolution[1])}px`
        }
        if(zoom[0]){
            zoomRef.current = zoom[0]
        }
        updatePaintVisSize()
    }, [zoom])

    useEffect(() => {
        if(resolution && resolution[0] && resolution[1] && canvasRef.current && undoCanvasRef.current){
            canvasRef.current.width = resolution[0]
            canvasRef.current.height = resolution[1]
            undoCanvasRef.current.width = resolution[0]
            undoCanvasRef.current.height = resolution[1]
            const context = canvasRef.current.getContext("2d")

            if(context && frontColor[1] && back){
                //context.imageSmoothingEnabled = false
                //initial background fill
                context.fillStyle = frontColor[1]
                context.fillRect(0,0,resolution[0],resolution[1]) 

                console.log(context.getImageData(0,0, 1,1))
            }

            const wrapper = wrapperRef.current
            if(wrapper && canvasContainerRef.current){
                setZoom([Math.round((resolution[1] * 1000) / wrapper.clientHeight)/10, "original"])
            }
            updatePaintVisSize()
        }
    }, [resolution])
    


    function updatePreviewImg() {
        const canvas = canvasRef.current
        if(canvas){
            const img = canvas.toDataURL("image/jpg", 0.1)
            setPreviewImg(img)
            const documentIcon = document.getElementById("documentIcon")
            if(documentIcon){
            documentIcon.href = img
            }
            const dwnImg = document.getElementById("saveImg")
            if(dwnImg){
                dwnImg.src = img
                //dwnImg.style.aspectRatio = `${resolution[0]}/${resolution[1]}`
            }
        }
    }

    //what should happen if mouse is clicked or moved
    function actionOnClick (e:MouseEvent) {
        switch(curTool.current){
            case "eraser":
                switch(eraserTypeRef.current){
                    case "secondary":
                        drawLine(e)
                        break
                    case "transparent":
                        erase(e)
                        break
                }
                break

            case "brush":
                drawLine(e)
                break

            case "pipette":
                pickColor(e)
                break

            case "move":
                moveCanvas(e)
                break
            case "fill":
                const pos = getMouseCanvasPos(e)
                const canvas = canvasRef.current
                const context = canvas?.getContext("2d")
                if(canvas && context && pos && pos[0] && pos[1]){
                    fill(context, canvas, Math.floor(pos[0]), Math.floor(pos[1]), context.getImageData(pos[0], pos[1], 1, 1).data, [255, 0, 0])
                }
                break
        }
    }

    //recursive flood fill algo
    function fill(context:CanvasRenderingContext2D, canvas:HTMLCanvasElement, initX:number, initY:number, removeColor:Uint8ClampedArray, fillColor:rgbColor){
        //initializing data, that with the recursive habit of floodFill() would be generated over and over again
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const remove:rgbColor = [removeColor[0], removeColor[1], removeColor[2]]
        const fillColor2 = [...fillColor, 255] //add transparency
        //const checked: [number, number][] = [] //keeps track of already checked pixels. NOT USED because it makes the code a little slower
        floodFill(context, canvas, initX, initY, remove, fillColor)

        function floodFill (context:CanvasRenderingContext2D, canvas:HTMLCanvasElement, x:number, y:number, removeColor:rgbColor, fillColor:rgbColor){
            const redPos = (y * canvas.width * 4) + x * 4 //index in imageData.data array of the red value (0-255), next indexes are g & b
            const cur = [imageData.data[redPos], imageData.data[redPos+1], imageData.data[redPos+2]]
            const removing = areEqualArrays(cur, remove) //check if the current pixel has the right color, so it can be overwritten
            if(removing && x >= 0 && y >= 0 && x < canvas.width && y < canvas.height){
                for(let i = 0; i < 4; i++){
                    imageData.data[redPos+i] = fillColor2[i]
                }
                //context.putImageData(imageData, 0, 0)//call putimageData() here and put floodFill()s inside setTimeout to show the fill process
                //setTimeout(() => {
                    floodFill(context, canvas, x+1, y, removeColor, fillColor)
                    floodFill(context, canvas, x-1, y, removeColor, fillColor)
                    floodFill(context, canvas, x, y+1, removeColor, fillColor)
                    floodFill(context, canvas, x, y-1, removeColor, fillColor)
                //}, 0);
                
            }
        }
        context.putImageData(imageData, 0, 0)
    }

    //compare arrays
    function areEqualArrays(arr1:any[], arr2:any[]){
        if(arr1.length !== arr2.length){ //if they have different lengths
            return false
        }
        for(let i = 0; i < arr1.length; i++)
        {
            if(arr1[i] !== arr2[i]){ //if values at equal indexes arent the same
                return false
            }
        }
        return true
    }

    //reusable function to check if mouse is inside canvas
    function mouseInCanvas (e: MouseEvent) {
        if(paintVisRef.current && canvasContainerRef.current && canvasRef.current){
            const canvas = canvasContainerRef.current
            const canvasLeft = canvas.offsetLeft
            const canvasTop = canvas.offsetTop
            const mouseLeft = e.clientX
            const mouseTop = e.clientY
            return (mouseLeft > canvasLeft) && (mouseTop > canvasTop) && 
                (mouseLeft < canvasLeft+canvas.clientWidth) && (mouseTop < canvasTop+canvas.clientHeight)
        }
    }

    //change translation of canvas
    function moveCanvas (e: MouseEvent){
        if(lastPos.current && canvasContainerRef.current){
            const container = canvasContainerRef.current
            const difX = e.clientX - lastPos.current[0]
            const difY = e.clientY - lastPos.current[1]
            setContainerTrans(prev => [difX + prev[0], difY + prev[1]]) //useEffect then handles the styling
            lastPos.current = [e.clientX, e.clientY]
        } else {
            lastPos.current = [e.clientX, e.clientY]
        }
    }

    //change color based on mouseclick
    function pickColor(e: MouseEvent) {
        if(mouseInCanvas(e)){
            switch(e.button){
                case 0:
                    setFrontColor(prev => [pickedColorRef.current, prev[1]])
                    break
                case 2:
                    setFrontColor(prev => [prev[0], pickedColorRef.current])
            }
        }
    }

    //check for color on canvas where mouse is positioned, but only when hovering over canvas
    function updatePipette (e: MouseEvent){
        const inCanvas = mouseInCanvas(e)
        if(inCanvas && paintVisRef.current && canvasContainerRef.current && canvasRef.current){
            const canvasCtx = canvasRef.current.getContext("2d")
            const canvas = canvasContainerRef.current

            const pos = getMouseCanvasPos(e)

            if(canvasCtx && inCanvas && pos && pos[0] && pos[1]){
                const data = canvasCtx.getImageData(pos[0], pos[1], 1, 1).data
                setPickedColor(rgbToHex(data[0], data[1], data[2]))
            }
        }
    }

    //moving the paindVis, with which the colorpicker and brushsizes are displayed
    function movePaintVis (e: MouseEvent) {
        if(wrapperRef.current){
            const left = wrapperRef.current.offsetLeft
            const top = wrapperRef.current.offsetTop
            const vis = paintVisRef.current

            if(left && top && vis && canvasRef.current){
                vis.style.left = `${e.clientX - left - vis.width/2}px`
                vis.style.top = `${e.clientY - top - vis.height/2}px`
                //vis.style.height = `${brushSizeRef.current * canvasRef.current.clientHeight/canvasRef.current.height}px`
            }
        }
    }

    //change size of paintVis canvas and in some cases render content to it
    function updatePaintVisSize () {
        const vis = paintVisRef.current
        if(brushSize && vis && curTool.current){
            let size = 5;
            switch(curTool.current){ //different sizes for each tool possible
                case "brush":
                case "eraser":
                    //brush size normalized to canvas pixel size on screen:
                    if(wrapperRef.current){
                        size = parseInt(brushSize) * ((wrapperRef.current.clientHeight * zoom[0]/100)/resolution[1]) + 2
                    } else {
                        size = parseInt(brushSize)
                    }
                    break
                case "pipette":
                    size = 200
                    break
                default:
                    size = 200
            }
            vis.width = size
            vis.height = size
            const context = vis.getContext("2d")
            if(context){
                switch(curTool.current){
                    case "eraser": //rendering eraser brush
                        context.strokeStyle = "#f455b2"
                        switch(eraserTypeRef.current){
                            case "secondary":
                                context.beginPath()
                                context.arc((size/2), (size/2), (size-2)/2, 0, Math.PI*2, true)
                                context.stroke()
                                break
                            case "transparent":
                                context.strokeRect(0, 0, size-1, size-1)
                        }
                        break
                    case "brush": //rendereing paintbrush
                        context.strokeStyle = "#3e5159"
                        context.beginPath()
                        context.arc((size/2), (size/2), (size-2)/2, 0, Math.PI*2, true)
                        context.stroke()
                        break
                    case "pipette": //rendering for pipette is handled elsewhere
                        break
                }
            }
        }
    }

    //size the container to fill the most available space without overlappint the toolbars
    function zoomFillScreen () {
        if(resolution && resolution[0] && resolution[1] && canvasContainerRef.current){
            if(wrapperRef.current && resolution[1] >= wrapperRef.current.clientHeight){
                //initial resolution is larger than viewport
                canvasContainerRef.current.style.height = "99%"
            } else {
                canvasContainerRef.current.style.width = "99%"
                if(wrapperRef.current && canvasContainerRef.current.clientHeight >= wrapperRef.current.clientHeight){
                    //scaled to viewport sides results in height being more than viewport height: adjust height
                    canvasContainerRef.current.style.height = "99%"
                }
            }
        }
    }

    //remove height/width styling for canvasContainer
    function zoomOriginal () {
        if(canvasContainerRef.current){
            canvasContainerRef.current.style.height = "unset"
            canvasContainerRef.current.style.width = "unset"
        }
    }

    function getMouseCanvasPos(e:MouseEvent){
        const canvas = canvasRef.current
        const container = canvasContainerRef.current
        const wrapper = wrapperRef.current
        const zoomR = zoomRef.current

        if(canvas && container && wrapper && zoomR){
            const top = container.offsetTop + wrapper.offsetTop

            const canvasWidth = canvas.width * ((wrapper.clientHeight * (zoomR/100))/canvas.height) //.width = real canvas resolution width
            const left = (wrapper.clientWidth - canvasWidth)/2 + wrapper.offsetLeft

            const transform = containerTransRef.current
            let x, y

            if(left && top && canvas){ //normalises positions to canvas native resolution coordinates
                x = (e.clientX - left - transform[0]) * (canvas.width/canvas.clientWidth)
                y = (e.clientY - top - transform[1]) * (canvas.height/canvas.clientHeight)
            }

            return([x, y])
        }
    }


    //drawing with the brush/eraser
    function drawLine (e: MouseEvent) {
        const canvas = canvasRef.current
        const context = canvas?.getContext("2d")
        const mousePos = getMouseCanvasPos(e)
        let x, y
        if(mousePos){
            x = mousePos[0]
            y = mousePos[1]
        }
        const opactiy = brushOpacityRef.current

        if(context && x && y && opactiy){
            //context.imageSmoothingEnabled = false
            if(color.current && curTool.current){
                //change to foreground or background color
                switch(curTool.current){
                    case "brush":
                        context.strokeStyle = color.current[0]
                        break
                    case "eraser":
                        context.strokeStyle = color.current[1]
                        break
                }
            }
            if(size.current){
                context.lineWidth = size.current
            }
            
            context.globalAlpha = opactiy/100
            context.lineCap = "round"
            context.beginPath()
            
            if(!lastPos.current){ //it hasnt been drawn on this mousedown yet
                context.moveTo(x, y)
            } else { //this path begins at last position
                context.moveTo(lastPos.current[0], lastPos.current[1])
            }

            context.lineTo(x, y)
            context.stroke()
            lastPos.current = [x, y]
        }
    }

    //use clearRect to set all affected pixels to be fully transparent
    function erase (e: MouseEvent) {
        const mousePos = getMouseCanvasPos(e)
        let x, y
        if(mousePos){
            x = mousePos[0]
            y = mousePos[1]
        }

        const context = canvasRef.current?.getContext("2d")
        const size = brushSizeRef.current

        if(context && x && y && size){
            context.clearRect(x-(size/2), y-(size/2), size, size)
        }
    }


    //A bunch of changing functions:
    function changeCheck () {
        setBack(prev => !prev)
    }

    function changeBackground (e) {
        setFrontColor(prev => [prev[0], e.target.value])
    }

    function createProj () {
        if(resX.current && resY.current){
            setResolution([parseInt(resX.current.value), parseInt(resY.current.value)])
        }
    }

    function changePreset (e) {
        setPreset(e.target.value)
    }

    function changeZoom (e) {
        setZoom(prev => [prev[0], e.target.value === true? "Fill screen" : "-"])
    }

    function changeProjName (e) {
        setProjName(e.target.value)
    }



    return (
        <div ref={wrapperRef} id="canvasWrapper" className={`canvasWrapper ${(tool && resolution)? `canvasWrapper_${tool}` : ""}`}>
            {resolution ?
            <>
                <div
                    ref={canvasContainerRef}
                    className={`
                        canvasContainer 
                        ${tool? `canvasContainer_${tool}` : ""} 
                        ${mousedown.current? "noTransition" : ""}
                    `}
                    >
                    <canvas className={`mainCanvas ${zoom[0] > 100 ? "pixalated" : ""}`} ref={canvasRef} id="canvas">
                        :/ Canvas can't be rendered: Try to enable JavaScript or use a different browser!
                    </canvas>
                    <canvas ref={undoCanvasRef} id="undoCanvas" className="undoCanvas"></canvas>
                </div>
                <canvas 
                        ref={paintVisRef}
                        className="paintVisCanvas"
                    ></canvas>
                {(tool === "move" || zoom[0] > 140) &&
                    <div className={`locationMapContainer ${zoom[0] > 100 ? "locationMapContainer-visible" : ""}`}>
                        {zoom[0] > 100 && previewImg &&
                            <>
                                <img className="locationMap" src={previewImg} alt="couldnt set preview image :/"></img>
                                <div className="positionVis" 
                                    style={{
                                        height: `${10000/zoom[0]}%`,
                                        transform: `translate( 
                                            calc(-50% - ${(containerTrans[0]*((canvasContainerRef.current!.clientWidth*100)/wrapperRef.current!.clientWidth))/canvasContainerRef.current!.clientWidth}%), 
                                            calc(-50% - ${(containerTrans[1]*zoom[0])/canvasContainerRef.current!.clientHeight}%))`,
                                        aspectRatio: `${wrapperRef.current?.clientWidth}/${wrapperRef.current?.clientHeight}`
                                        }} 
                                >
                                    <div className="visSides" />    
                                </div>
                            </>
                        }
                    </div>
                }
                
            </>

            :

            <div className="newProject">
                <div className="createPart">
                    <h1 className="">Create a new project</h1>
                    <div className="newProjMain">
                        <label title="The name is displayed on the browsers tab card, inside the app and it's used to save the image under that name.">
                            Project name
                            <input type="text" placeholder="(optional)" value={projName} onChange={changeProjName}></input>
                        </label>
                        <div className="inputs">
                            <div className="inputPixels" title="Set the width of your project">
                                <span>↔</span>
                                <input ref={resX} type="number" defaultValue={Math.round(window.innerWidth*0.75/480)*480}></input>
                                <span>px</span>
                            </div>
                            <div className="inputPixels" title="Set the height of your project">
                                <span>↕</span>
                                <input ref={resY} type="number" defaultValue={Math.round(window.innerHeight*0.75/360)*360}></input>
                                <span>px</span>
                            </div>
                        </div>
                        <div className="inputs">
                            <div className="inputBack" title="Change if the project should initially have a background or be transparent">
                                <input type="checkbox" id="check" checked={back} onChange={changeCheck}></input>
                                <span className={back? "showBack" : "showLineThrough"}>Background</span>
                                {back
                                    ? <input type="color" value={frontColor[1]} onChange={changeBackground}></input>
                                    : <div className="showTrans"></div>
                                }
                            </div>
                            <div className="inputBack" title="(Fill screen) If the image should fill the most possible space of the viewport without overlapping">
                                <input type="checkbox" value={zoom[1] === "Fill screen"} onChange={changeZoom} />
                                <span className={inzoom? "showBack" : "showLineThrough"}>Zoom to viewport</span>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="createBtn" onClick={createProj}>Create</button>
                </div>
                
                <div className="resPresets">
                    <div className="resPresets_header">
                        <h1 className="">Resolution presets:</h1>
                        <select onChange={changePreset}>
                            <option>Widescreen</option>
                            <option>Square</option>
                            <option>iPhone</option>
                            <option>iPhone Plus/Pro/Max</option>
                            <option>iPhone mini/SE</option>
                        </select>
                    </div>
                    
                        {preset === "Widescreen" &&
                            <div className="resPresContainer">
                                <ResolutionPreset name="QHD" resolution={[640, 360]} change={[resX, resY]} />
                                <ResolutionPreset name="720p" resolution={[1280, 720]} change={[resX, resY]} />
                                <ResolutionPreset name="FHD" resolution={[1920, 1080]} change={[resX, resY]} />
                                <ResolutionPreset name="WQHD" resolution={[2560, 1440]} change={[resX, resY]} />
                                <ResolutionPreset name="UHD 4K" resolution={[3840, 2160]} change={[resX, resY]} />
                                <ResolutionPreset name="FUHD 8K" resolution={[7680, 4320]} change={[resX, resY]} />
                            </div>
                        }
                        {preset === "Square" &&
                            <div className="resPresContainer">
                                <ResolutionPreset name="Tiny" resolution={[64, 64]} change={[resX, resY]} />
                                <ResolutionPreset name="Small" resolution={[256, 256]} change={[resX, resY]} />
                                <ResolutionPreset name="Medium" resolution={[512, 512]} change={[resX, resY]} />
                                <ResolutionPreset name="Standard" resolution={[1024, 1024]} change={[resX, resY]} />
                                <ResolutionPreset name="Large" resolution={[2048, 2048]} change={[resX, resY]} />
                                <ResolutionPreset name="XL" resolution={[4096, 4096]} change={[resX, resY]} />
                            </div>
                        }
                        {preset === "iPhone" &&
                            <div className="resPresContainer">
                                <ResolutionPreset name="4, 4s" resolution={[640, 960]} change={[resX, resY]} />
                                <ResolutionPreset name="5, 5s" resolution={[640, 1136]} change={[resX, resY]} />
                                <ResolutionPreset name="6-8" resolution={[750, 1334]} change={[resX, resY]} />
                                <ResolutionPreset name="X, XS" resolution={[1125 ,2436]} change={[resX, resY]} />
                                <ResolutionPreset name="XR, 11" resolution={[828, 1792]} change={[resX, resY]} />
                                <ResolutionPreset name="12-14" resolution={[1170, 2532]} change={[resX, resY]} />
                            </div>
                        }
                        {preset === "iPhone Plus/Pro/Max" &&
                            <div className="resPresContainer">
                                <ResolutionPreset name="6-8 Plus" resolution={[1242, 2208]} change={[resX, resY]} />
                                <ResolutionPreset name="XS Max" resolution={[1242, 2688]} change={[resX, resY]} />
                                <ResolutionPreset name="11 Pro/Max" resolution={[1242, 2688]} change={[resX, resY]} />
                                <ResolutionPreset name="12/13 Pro" resolution={[1170, 2532]} change={[resX, resY]} />
                                <ResolutionPreset name="12/13 Max" resolution={[1284, 2778]} change={[resX, resY]} />
                                <ResolutionPreset name="14 Plus" resolution={[1284, 2778]} change={[resX, resY]} />
                                <ResolutionPreset name="14 Pro" resolution={[1179, 2556]} change={[resX, resY]} />
                                <ResolutionPreset name="14 Max" resolution={[1290, 2796]} change={[resX, resY]} />
                            </div>
                        }
                        {preset === "iPhone mini/SE" &&
                            <div className="resPresContainer">
                                <ResolutionPreset name="SE 2016" resolution={[640, 1136]} change={[resX, resY]} />
                                <ResolutionPreset name="SE 2020/22" resolution={[750, 1334]} change={[resX, resY]} />
                                <ResolutionPreset name="12/13 mini" resolution={[1080, 2340]} change={[resX, resY]} />
                            </div>
                        }
                    
                </div>
            </div>
            }
            
            <div className={resolution && resolution[0] && resolution[1]? "canvasInfo" : "canvasInfo_invis canvasInfo"}>
                {projName !== "" &&
                    <span title="Your projects name">{projName} </span>
                }
                {resolution && resolution[0] && resolution[1] &&
                <>
                    <span title="The resolution of this canvas">
                        {`${resolution[0]}×${resolution[1]}`}
                    </span>
                    <span title="Aproximated raw size">
                        {`~${Math.round((resolution[0] * resolution[1] * 4)/10000)/100}MB`}
                    </span>
                </>
                }
            </div>
        </div>
    )
}