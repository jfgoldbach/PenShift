export function heightForFill (resolutionY: number) {
    const container = document.getElementById("canvasContainer")
    const wrapper = document.getElementById("canvasWrapper")
    if(container && wrapper){
        const heightScaleFactor = (wrapper.clientHeight/container.clientHeight) * 0.99
        const widthScaleFactor = (wrapper.clientWidth/container.clientWidth) * 0.99
        if(container.clientWidth * heightScaleFactor <= wrapper.clientWidth) {
            return 99
        } else {
            const widthAdjustedHeight = Math.round(((resolutionY * widthScaleFactor)/wrapper.clientHeight) * 1000) / 10
            return widthAdjustedHeight
        }
    }
    return 99
}

export function scrollHorz(bar: HTMLElement | undefined | null, setScroll: React.Dispatch<React.SetStateAction<string>>){
    if(bar){
        let classes = ""
        if(bar.scrollLeft > 20){
            classes += "left"
        }
        if(bar.scrollLeft < bar.scrollWidth - bar.clientWidth - 20){
            classes += " right"
        }
        setScroll(classes)
    }
}

export function scrollVert(bar: HTMLElement | undefined | null, setScroll: React.Dispatch<React.SetStateAction<string>>){
    if(bar){
        let classes = ""
        if(bar.scrollTop > 20){
            classes += "top"
        }
        if(bar.scrollTop < bar.scrollHeight - bar.clientHeight - 20){
            classes += " bottom"
        }
        setScroll(classes)
    }
}
