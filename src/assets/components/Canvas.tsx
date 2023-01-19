import { useRef, useEffect, useState, useContext } from "react"
import { areEqualArrays, hexToRgb, rgbToHex } from "../helper/helperFunctions"
import { rgbColor, toolType, undoRedoObj } from "../types/types"
import { CreatePrompt } from "./CreatePrompt"
import { heightForFill } from "./FrequentlyUsedFunctions"
//import "./styles/Canvas.css"
import { stateContext } from "./Viewport"



//its getting verbose: put (stateful) logic in importable functions
export function Canvas() {
    const {resolution, brushOpacity, frontColor, setFrontColor, brushSize, 
        zoom, setZoom, tool, projName, eraseType, containerTrans, setRename,
        setContainerTrans, waiting, setWaiting, undoPos} = useContext(stateContext)


    const canvasRef = useRef<HTMLCanvasElement>(null)
    const undoCanvasRef = useRef<HTMLCanvasElement>(null)
    const paintVisRef = useRef<HTMLCanvasElement>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const resX = useRef<HTMLInputElement>(null)
    const resY = useRef<HTMLInputElement>(null)

    const [back, setBack] = useState(true)
    const [preset, setPreset] = useState("Widescreen")
    const [inzoom, setInzoom] = useState(false)
    const [pickedColor, setPickedColor] = useState<string>()
    const [previewImg, setPreviewImg] = useState<string>()
    const [originalZoom, setOriginalZoom] = useState<number>(100)
    const [timetravel, setTimetravel] = useState<undoRedoObj>()

    const mousedown = useRef(false)
    //const lastPos = useRef<[number, number]>() //is used for drawing on, and moving the canvas
    let lastPos: [number, number] |undefined
    const pickedColorRef = useRef<string>()
    const eraserTypeRef = useRef<string>()
    const brushSizeRef = useRef<number>()
    const brushOpacityRef = useRef<number>()
    const size = useRef<number>()
    const color = useRef<[string, string]>()
    const curTool = useRef<toolType>()
    const containerTransRef = useRef<[number,number]>([0,0])
    const zoomRef = useRef<string>()



    class queue {
        pixel: [number,number][]
        maxlength: number
        messageOnOverflow: string

        constructor(firstEntry:[x:number,y:number], maxlength: number, messageOnOverflow: string = "Queue Overflow"){
            this.pixel = [firstEntry]
            this.maxlength = maxlength
            this.messageOnOverflow = messageOnOverflow
        }

        get queue(){
            return this.pixel
        }

        enqueue (coords: [number, number]){
            if(this.pixel.length < this.maxlength){
                if(this.noDuplicate(coords[0], coords[1])){ //only pushes if these coordinates dont currently exist in the queue.
                    this.pixel.push(coords)
                }
                //console.log("enqueue", coords)
                //console.log( "length: ", this.pixel.length)
            } else {
                console.error(`Queue overflow! Maximal number of entries has been reached: ${this.maxlength}. Queue has been emptied.`)
                this.pixel = []
                window.alert(this.messageOnOverflow)
            }
        }

        dequeue(){
            if(this.pixel.length > 0){
                //console.log("dequeue", this.pixel[0])
                this.pixel.shift()
                //console.log( "length: ", this.pixel.length)
            } else {
                console.error("Can't dequeue because queue is empty!")
            }
        }

        next(){
            if(this.pixel.length !== 0){
                return this.pixel[0]
            } else {
                console.error("Can't return next entry: queue is empty!")
            }
        }

        notEmpty(){
            return (this.pixel.length > 0)
        }

        length(){
            return this.pixel.length
        }

        noDuplicate(x:number, y:number){
            //return this.pixel.filter(i => (i[0] === x && i[1] === y)).length === 0 //is slow.
            //return this.pixel.every(i => !(i[0] === x && i[1] === y)) // a lot faster but still slower than forEach
            let dupli = true
            //this.pixel.forEach(i => { //problem: forEach wont stop searching until the last item is reached, which may slow it down
            //    if(i[0] === x && i[1] === y){
            //        dupli = false
            //    }
            //});
            for(let i = 0; i<this.length(); i++){
                if(this.pixel[i][0] === x && this.pixel[i][1] === y){
                    dupli = false
                    break
                }
                if(!dupli){
                    console.log("this is wrong")
                }
            }
            return dupli
            
        }
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
        centerPaintVis()
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
        document.addEventListener("pointerdown", (e) => {
            if(e.target === wrapperRef.current || e.target === canvasRef.current){
                actionOnClick(e)
                mousedown.current = true
                if(paintVisRef.current){
                    paintVisRef.current.style.display = "block"
                }
                if(paintVisRef.current){
                    movePaintVis(e)
                }
            }
        })
        document.addEventListener("pointerup", () => {
            lastPos = undefined
            mousedown.current = false
            updatePreviewImg()
            if(paintVisRef.current && window.innerWidth < 900){
                paintVisRef.current.style.display = "none"
            }
        })
        document.addEventListener("pointermove", (e) => {
            //console.log("pointermove")
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
        const zoomLevel = typeof zoom[0] === "number"? zoom[0] : parseFloat(zoom[0])
        if(zoom[0] && canvasContainerRef.current && resolution && wrapperRef.current){
            canvasContainerRef.current.style.height = zoom[0] + "%"
            canvasContainerRef.current.style.width = `${wrapperRef.current.clientHeight * (zoomLevel/100) * (resolution[0]/resolution[1])}px`
        }
        if(zoom[0]){
            zoomRef.current = (zoom[0]).toString()
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
            }

            const wrapper = wrapperRef.current
            if(inzoom){
                setZoom([heightForFill(resolution[1]), "fill"])
            } else {
                if(wrapper && canvasContainerRef.current){
                    setZoom([Math.round((resolution[1] * 1000) / wrapper.clientHeight)/10, "original"])
                }
            }
            updatePaintVisSize()
            if(wrapperRef.current){
                setOriginalZoom(Math.round((resolution[1] * 1000) / wrapperRef.current.clientHeight)/10)
            }
        }
    }, [resolution])
    


    function saveToTimetravel (data: ImageData) { //undo & redo
        const undos = 3
        const redos = 3
        let ops
        if(timetravel === undefined){ 
            //no undos/redos yet
            setTimetravel([data])
        } else {
            ops = timetravel
            ops.push(data)
            if(timetravel && ops){
                //check if there are too many undos/redos
                if(undoPos > undos - 1){
                    ops.shift()
                } 
                else if (ops.length - undoPos > redos - 1){pickedColor
                    ops.pop()
                }
            }
            setTimetravel(ops)
        }
    }

    //function undo () {
    //    const canvas = canvasRef.current
    //    if(canvas && timetravel && timetravel.operations.length > 0 && timetravel.position !== 0){
    //        canvas.getContext("2d")?.putImageData(timetravel.operations[timetravel.position - 1], 0, 0)
    //    }
    //}

    function updatePreviewImg () {
        const canvas = canvasRef.current
        if(canvas){
            const img = canvas.toDataURL("image/webp", 0.1) //maybe adjust picture type, so that every browser supports it for sure
            setPreviewImg(img)
            const documentIcon = document.getElementById("documentIcon") as HTMLLinkElement
            if(documentIcon){
                documentIcon.href = img
            }
            const dwnImg = document.getElementById("saveImg") as HTMLImageElement
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
            case "brush": drawLine(e); break
            case "pipette": pickColor(e); break
            case "move": moveCanvas(e); break
            case "fill":
                setWaiting(true)
                setTimeout(() => {
                    if(color.current){
                        const pos = getMouseCanvasPos(e)
                        const canvas = canvasRef.current
                        const context = canvas?.getContext("2d")
                        const fillColor = hexToRgb(color.current[0])
                        if(canvas && context && pos && pos[0] && pos[1] && fillColor){
                            fill(context, canvas, Math.floor(pos[0]), Math.floor(pos[1]), context.getImageData(pos[0], pos[1], 1, 1).data, fillColor)
                        }
                    }
                }, 0); //timeout will be called after waiting state is set to true
                break
        }
    }

    


    //recursive flood fill algo 
    //Remark: reacts strict mode causes queue overflows!
    function fill(context:CanvasRenderingContext2D, canvas:HTMLCanvasElement, initX:number, initY:number, removeColor:Uint8ClampedArray, fill:rgbColor){
        //initializing data, that with the recursive habit of floodFill() would be generated over and over again without changing
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const remove:rgbColor = [removeColor[0], removeColor[1], removeColor[2]]
        const fillColor = [...fill, 255] //add transparency
        const errorMsg = "Area too large to fill completly. As much as possible will be filled. Please try again or choose a smaller area!"
        const list = new queue([initX, initY], 3000, errorMsg)

        //return true if pixel is in canvas and has right color
        function isPixelFillable (x: number, y: number){
            const redPos = getRedPos(x,y)
            const curColor: rgbColor = [imageData.data[redPos], imageData.data[redPos+1], imageData.data[redPos+2]]
            const rightColor = areEqualArrays(curColor, remove) //check if the current pixel has the right color, so it can be overwritten
            const valid = (list.notEmpty() && rightColor && x >= 0 && y >= 0 && x < canvas.width && y < canvas.height) //assignable to queue, has right color & is inside canvas
            return valid
        }

        //getting the red position at given coordinates on the image data array
        function getRedPos(x: number, y: number){
            return (y * canvas.width * 4) + x * 4
        }

        //changing pixel color and enqueue next pixels to fill
        function floodFill (){
            const pos = list.next()
            if(pos){
                const x = pos[0]
                const y = pos[1]
                const redPos = getRedPos(x, y) //index in imageData.data array of the red value (0-255), next indexes are green, blue, alpha


                for(let i = 0; i < 4; i++){
                    imageData.data[redPos+i] = fillColor[i]
                }

                if(isPixelFillable(x+1, y)){
                    list.enqueue([x+1, y])
                }
                if(isPixelFillable(x-1, y)){
                    list.enqueue([x-1, y])
                }
                if(isPixelFillable(x, y+1)){
                    list.enqueue([x, y+1])
                }
                if(isPixelFillable(x, y-1)){
                    list.enqueue([x, y-1])
                }


                if(list.notEmpty()){
                    list.dequeue() //remove current entry
                }
            }
        }

        while(list.notEmpty()){
            floodFill()
        }

        context.putImageData(imageData, 0, 0)
        updatePreviewImg()
        setWaiting(false)
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
        if(lastPos && canvasContainerRef.current){
            const container = canvasContainerRef.current
            const difX = e.clientX - lastPos[0]
            const difY = e.clientY - lastPos[1]
            setContainerTrans((prev: [number, number]) => [difX + prev[0], difY + prev[1]]) //useEffect then handles the styling
            lastPos = [e.clientX, e.clientY]
        } else {
            lastPos = [e.clientX, e.clientY]
        }
    }

    //change color based on mouseclick
    function pickColor(e: MouseEvent) {
        if(mouseInCanvas(e)){
            const color = pickedColorRef.current
            if(color){
                switch(e.button){
                    case 0:
                        setFrontColor((prev: [string, string]) => [color, prev[1]]); break
                    case 2:
                        setFrontColor((prev: [string, string]) => [prev[0], color]); break
                }
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
                const color = rgbToHex(data[0], data[1], data[2])
                setPickedColor(color)
            }
        }
    }

    //moving the paindVis, with which the colorpicker and brushsizes are displayed
    function movePaintVis (e: MouseEvent) {
        if(wrapperRef.current){
            const left = wrapperRef.current.offsetLeft
            const top = wrapperRef.current.offsetTop
            const vis = paintVisRef.current
            if(vis && left !== undefined && top !== undefined && vis !== undefined){
                vis.style.left = `${e.clientX - left - vis.width/2}px`
                vis.style.top = `${e.clientY - top - vis.height/2}px`
            }
        }
    }

    function centerPaintVis () {
        const wrapper = wrapperRef.current
        if(wrapper){
            if(window.innerHeight < 900){
                const left = (wrapper.clientWidth - wrapper.offsetLeft) / 2
                const top = (wrapper.clientHeight - wrapper.offsetTop) / 2
                const vis = paintVisRef.current

                if(left && top && vis && canvasRef.current){
                    vis.style.left = `${left - vis.width/2}px`
                    vis.style.top = `${top - vis.height/2}px`
                }
            } else {
                const left = wrapper.clientWidth / 2
                const top = wrapper.clientHeight / 2
                const vis = paintVisRef.current

                if(left && top && vis && canvasRef.current){
                    vis.style.left = `${left - vis.width/2}px`
                    vis.style.top = `${top - vis.height/2}px`
                }
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
                    const brushWidth = typeof brushSize === "number"? brushSize : parseFloat(brushSize)
                    if(wrapperRef.current && resolution){
                        size = brushWidth * ((wrapperRef.current.clientHeight * zoom[0]/100)/resolution[1]) + 2
                    } else {
                        size = brushWidth
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
        const container = canvasContainerRef.current
        if(container){
            container.style.height = `${zoom[0]}`
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

            const canvasWidth = canvas.width * ((wrapper.clientHeight * (parseFloat(zoomR)/100))/canvas.height) //.width = real canvas resolution width
            const left = (wrapper.clientWidth - canvasWidth)/2 + wrapper.offsetLeft

            const transform = containerTransRef.current
            let x, y

            if(left && top && canvas){ //normalises positions to canvas native resolution coordinates
                x = (e.clientX - left - transform[0]) * (canvas.width/canvas.clientWidth)
                y = (e.clientY - top - transform[1]) * (canvas.height/canvas.clientHeight)
                //console.log([e.clientX, left, transform[0], canvas.width/canvas.clientWidth], [e.clientY, top, transform[1], canvas.height/canvas.clientHeight])
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
            
            if(!lastPos){ //it hasnt been drawn on this mousedown yet
                context.moveTo(x, y)
            } else { //this path begins at last position
                context.moveTo(lastPos[0], lastPos[1])
            }

            context.lineTo(x+0.0001, y+0.0001)  //addition of small number is for safari/iOS, because...
            context.stroke()                    //...it wouldn't render the path when beginning and ending at same location
            lastPos = [x, y]
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




    return (
        <div ref={wrapperRef} id="canvasWrapper" className={`canvasWrapper ${waiting? "waiting" : ""} ${(tool && resolution)? `canvasWrapper_${tool}` : ""}`}>
            {resolution ?
            <>
                <div
                id="canvasContainer"
                ref={canvasContainerRef}
                className={`
                    canvasContainer 
                    ${tool? `canvasContainer_${tool}` : ""} 
                    ${mousedown.current? "noTransition" : ""}
                `}
                >
                    <canvas className={`mainCanvas bg-trans ${zoom[0] > originalZoom ? "pixalated" : ""}`} ref={canvasRef} id="canvas">
                        :/ Canvas can't be rendered: Try to enable JavaScript or use a different browser!
                    </canvas>
                    {/*<div className="pixelgrid absolute-fill"></div>*/}
                    <canvas ref={undoCanvasRef} id="undoCanvas" className="undoCanvas"></canvas>
                </div>

                <canvas ref={paintVisRef} className="paintVisCanvas"></canvas>

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

            {waiting &&
                <div className="waitingVis">
                    {/*<img src="images/loading.png" />*/}
                    <div className="waitingVisTextContainer">
                        <p className="waitingVisText">Filling area</p>
                        <p className="waiting1">.</p>
                        <p className="waiting2">.</p>
                        <p className="waiting3">.</p>
                    </div>
                </div>
            }
                
            </>
            :
            <CreatePrompt back={back} setBack={setBack} resX={resX} resY={resY} setInzoom={setInzoom} preset={preset} setPreset={setPreset} />
            }
            
            <div className={resolution && resolution[0] && resolution[1]? "canvasInfo" : "canvasInfo_invis canvasInfo"}>
                <span className="projName" title="Your projects name (click to rename)" onClick={() => setRename(true)}>{projName !== ""? projName : <i>Unnamed</i>}</span>
                {resolution && resolution[0] && resolution[1] &&
                <>
                    <span title="The resolution of this canvas">
                        {`${resolution[0]}×${resolution[1]}`}
                    </span>
                    <span title="Aproximated raw size">
                        {`${Math.round((resolution[0] * resolution[1] * 4)/10000)/100}MB`}
                    </span>
                </>
                }
            </div>
        </div>
    )
}