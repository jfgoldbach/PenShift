function numberToHex (n:number){
    return n.toString(16).padStart(2,"0")
}

export function rgbToHex (r:number ,g:number ,b:number) {
    return(`#${numberToHex(r)}`)
}


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