//import "./styles/Message.css"

type messageProps = {
    message: string,
    type?: string
}


export function Message ({message}: messageProps) {
    return(
        <div className="messageContainer">
            <p>{message}</p>
        </div>
    )
}