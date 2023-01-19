import { useContext, useEffect, useRef, useState } from "react";
import { heightForFill, scrollVert } from "./FrequentlyUsedFunctions";
import { ResolutionPreset } from "./ResolutionPreset";
import { stateContext } from "./Viewport";

type createProps = {
    back: boolean, setBack: React.Dispatch<React.SetStateAction<boolean>>,
    resX: React.MutableRefObject<HTMLInputElement | null>,
    resY: React.MutableRefObject<HTMLInputElement | null>,
    setInzoom: React.Dispatch<React.SetStateAction<boolean>>,
    preset: string, setPreset: React.Dispatch<React.SetStateAction<string>>
}



export function CreatePrompt({back, setBack, resX, resY, setInzoom, preset, setPreset}: createProps) {
    const {setResolution, frontColor, setFrontColor, 
        projName, setProjName} = useContext(stateContext)

    const [checked, setChecked] = useState(true)
    const [scroll, setScroll] = useState("")
    const promptRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setInzoom(checked)
        const createPrompt = promptRef.current
        if(createPrompt){
            scrollVert(createPrompt, setScroll)
            createPrompt.addEventListener("scroll", checkScroll)
        }
        function checkScroll() {
            scrollVert(createPrompt, setScroll)
        }

        return(() => {
            createPrompt?.removeEventListener("scroll", checkScroll)
        })
    }, [])

    function changeProjName (e: React.ChangeEvent<HTMLInputElement>) {
        setProjName(e.target.value)
    }

    function changeCheck () {
        setBack(prev => !prev)
    }

    function changeBackground (e: React.ChangeEvent<HTMLInputElement>) {
        setFrontColor((prev: [string, string]) => [prev[0], e.target.value])
    }

    function changeZoom () {
        setInzoom(!checked)
        setChecked(prev => !prev)
    }

    function createProj () {
        if(resX.current && resY.current){
            setResolution([parseInt(resX.current.value), parseInt(resY.current.value)])
        }
    }

    function changePreset (e: React.ChangeEvent<HTMLSelectElement>) {
        setPreset(e.target.value)
    }


        
    return(
        <div className={`newProject ${scroll}`} ref={promptRef}>
                <div className="createPart">
                    <h1 className="">Create a new project</h1>
                    <div className="newProjMain">
                        <label title="The namfille is displayed on the browsers tab card, inside the app and it's used to save the image under that name.">
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
                                <input type="checkbox" checked={checked} onChange={changeZoom} />
                                <span className={checked? "showBack" : "showLineThrough"}>Zoom to fit viewport</span>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="createBtn btn" onClick={createProj}>Create</button>
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
    )
}