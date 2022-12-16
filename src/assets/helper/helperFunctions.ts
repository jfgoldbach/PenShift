export function numberToHex (n:number){
    return n.toString(16).padStart(2,"0")
}

export function rgbToHex (r:number ,g:number ,b:number) {
    return(`#${numberToHex(r)}`)
}



//takes hex string and outputs rgb array
export function hexToRgb (hex: string){
    const threeHex = hex.replace("#", "").match(/.{1,2}/g)
    if(threeHex){
        const rgbArr:[r:number, g:number, b:number] = [
            parseInt(threeHex[0], 16),
            parseInt(threeHex[1], 16),
            parseInt(threeHex[2], 16)
        ]
        return rgbArr
    }
    console.error("Couldn't generate rgb array from ", hex)
}



export function areEqualArrays(arr1:any[], arr2:any[]){
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