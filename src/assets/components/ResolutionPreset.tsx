//import "./styles/ResolutionPreset.css"

type presetProps = {
    name: string
    resolution: [number, number]
    change: [
        React.MutableRefObject<HTMLInputElement | undefined | null>,
        React.MutableRefObject<HTMLInputElement | undefined | null>
    ]
}

export function ResolutionPreset ({name, resolution, change}: presetProps) {

    function changeInputs () {
        if(change[0].current && change[1].current){
            change[0].current.value = resolution[0].toString()
            change[1].current.value = resolution[1].toString()
        }
    }

    return(
        <button className="resPresWrapper btn" onClick={changeInputs}>
            <h1>{name}</h1>
            <p>{resolution[0]}&times;{resolution[1]}</p>
        </button>
    )
}
