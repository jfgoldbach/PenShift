export type rgbColor = [r:number, g:number, b:number]

export type undoRedoObj = ImageData[]

export type stateConType = {
    frontColor: [string, string];
    setFrontColor: React.Dispatch<React.SetStateAction<[string, string]>>;
    brushSize: number;
    setBrushSize: React.Dispatch<React.SetStateAction<number>>;
    brushOpacity: number,
    setBrushOpacity: React.Dispatch<React.SetStateAction<number>>;
    zoom: [number, string];
    setZoom: React.Dispatch<React.SetStateAction<[number | string, string]>>;
    tool: toolType | undefined;
    setTool: React.Dispatch<React.SetStateAction<toolType | undefined>>;
    projName: string;
    setProjName: React.Dispatch<React.SetStateAction<string>>;
    eraseType: eraseStyleType;
    setEraseType: React.Dispatch<React.SetStateAction<eraseStyleType>>;
    containerTrans: [number, number];
    setContainerTrans: React.Dispatch<React.SetStateAction<[number, number]>>;
    resolution: [number,number]|undefined;
    setResolution: React.Dispatch<React.SetStateAction<[number,number]|undefined>>;
    message: messageType|undefined;
    setMessage: React.Dispatch<React.SetStateAction<messageType|undefined>>;
    undoPos: number;
    setUndoPos: React.Dispatch<React.SetStateAction<number>>;
    waiting: boolean;
    setWaiting: React.Dispatch<React.SetStateAction<boolean>>;
    rename: boolean;
    setRename: React.Dispatch<React.SetStateAction<boolean>>

}

export type toolType = "brush" | "eraser" | "pipette" | "move" | "fill" | "text"

export type eraseStyleType = "secondary" | "transparent"

export type messageType = [string, "info" | "alert"]

export type formats= "png" | "jpeg" | "webp" | "ico" | "bmp" | "gif" | "tif"