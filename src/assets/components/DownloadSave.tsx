import React, { useContext, useEffect, useRef, useState } from "react"
import { formats } from "../types/types"
import { stateContext } from "./Viewport"
//import "./styles/DownloadSave.css"
//import "./styles/SavePrompt.css"



type settings = {
    format: formats,
    quality: number
}

export function DownloadSave () {
    const {resolution, waiting, projName} = useContext(stateContext)

    const [openSave, setOpenSave] = useState(false)
    const [previewImg, setPreviewImg] = useState("")
    const [saveSettings, setSaveSettings] = useState<settings>({format: "png", quality: 1})
    const [saveName, setSaveName] = useState("")
    const [supported, setSupported] = useState<string[]>([])

    const previewRef = useRef<HTMLImageElement>()

    const formats: formats[] = ["png", "jpeg", "webp", "ico", "bmp", "gif", "tif"]



    useEffect(() => { //check which formats the current browser supports
        const canvas = document.createElement("canvas")
        canvas.width = 1
        canvas.height = 1
        const supportedFormats: formats[] = []
        formats.forEach(i => {
            const isValid = canvas.toDataURL(`image/${i}`).startsWith(`data:image/${i}`)
            if(isValid){
                supportedFormats.push(i)
            }
        })
        canvas.remove()
        setSupported(supportedFormats)
    }, [])

    
    //instant download | dirty, but works: creates a new anchor element with the converted image as download and clicks it
    function genDownload () {
        const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement
        if(canvas){
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

    function togglePrompt () {
        setOpenSave(prev => !prev)
        refreshPreview(saveSettings)
    }

    function refreshPreview (updated: settings) {
            const canvas = document.getElementById("canvas") as HTMLCanvasElement
            let img;
            if(canvas && updated){
                img = canvas.toDataURL(`image/${updated.format}`, updated.quality)

            }
            if(img){
                setPreviewImg(img)
            }
    }

    function handleQuality (e: React.ChangeEvent<HTMLInputElement>) {
        const value = {...saveSettings, quality: parseFloat(e.target?.value)}
        setSaveSettings(value)
    }

    function handleFormat (e: React.ChangeEvent<HTMLSelectElement>) {
        const value: settings = {...saveSettings, format: e.currentTarget.value as formats}
        setSaveSettings(value)
        refreshPreview(value)
    }

    function handlePointerUp (e: React.PointerEvent<HTMLInputElement>) {
        const value = {...saveSettings, quality: parseFloat(e.currentTarget.value)}
        refreshPreview(value)
    }

    function handleName (e: React.ChangeEvent<HTMLInputElement>) {
        setSaveName(e.target.value)
    }

    function download (e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const dwn = document.createElement('a')
        dwn.href = previewImg
        dwn.download = `${saveName !== "" ? saveName : projName!==""?projName:"image" }`
        dwn.click()
        dwn.remove()
    }


    return(
        <div className="saveContainer">
            <button 
                    className={`saveBtn btn aspectCube ${resolution && !waiting ? "" : "unavailable"}`} 
                    onClick={togglePrompt} 
                    title={`Save "${projName !== "" ? projName : "image"}.png"`}
            >
                <img className="invert" src="images/selfmade/save2.svg" />
            </button>

            {openSave &&
                <div className="prompt savePreview">
                    <div className="settingsTop">
                        <h2>Save {saveName !== "" ? `"${saveName}"` : projName!==""?`"${projName}"`:"your project"}</h2>
                        <button className="closeBtn" onClick={togglePrompt}>&times;</button>
                    </div>
                    <div className="saveBottom">
                        <div className="saveShow">
                            <div className="imgContainer">
                                <img className={`bg-trans ${resolution && window.innerWidth*0.40 - 10 > resolution[0]? "pixalated" : ""}`} src={previewImg} alt="Preview of your image"></img>
                            </div>
                        </div>
                        <div className="saveLeftSide">
                            <form onSubmit={download}>
                                <label>
                                    Filename
                                    <input placeholder={projName? projName : "image"} value={saveName} onChange={handleName}></input>
                                </label>
                                <label>
                                    <p>
                                        Format
                                        {supported.length !== formats.length &&
                                            <img 
                                                className="info" 
                                                title={`Some formats are not supported by your browser:${formats.map(i => {
                                                    if(!supported.includes(i)){
                                                        return `\n${i}`
                                                    }
                                                }).join("")}`} 
                                                src="images/selfmade/info_light.svg" 
                                            />
                                        }
                                    </p>
                                    <select defaultValue={saveSettings.format} onChange={handleFormat}>
                                        {supported.map(i => 
                                                <option value={i}>{i}</option>
                                            )
                                        }
                                    </select>
                                </label>
                                <label className={["jpeg", "webp"].includes(saveSettings.format)? "" : "unavailable"}>
                                    Quality: {Math.round(saveSettings.quality * 100)}%
                                    <input 
                                        onPointerUp={handlePointerUp} onChange={handleQuality}
                                        value={saveSettings.quality}
                                        min={0} max={1} step={0.05}
                                        title="Quality setting only available for jpeg and webp"
                                        type="range">
                                    </input>
                                </label>
                                <button type="submit" className="btn">Save</button>
                            </form>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}