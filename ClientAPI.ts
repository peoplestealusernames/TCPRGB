import { request } from "https"
import { readFileSync } from "fs"
import { connect } from 'net'
import { Connection } from "./ConnectionClass"

const Path = JSON.parse(readFileSync('./Pass/HostName.json', 'utf-8'))

function GetIP(): Promise<{ port: number, ip: string }> {
    return new Promise((resolve, rej) => {
        const req = request(Path, { method: 'GET' }, res => {
            res.on('data', (data: any) => {
                resolve(JSON.parse(data))
            })
        })

        req.on('error', error => {
            rej(error)
        })

        req.end()
    })
}

export function GetSocket(): Promise<Connection> {
    return new Promise(async (resolve, rej) => {
        const HostAdress = await GetIP()
        const socket = connect({ port: HostAdress.port, host: HostAdress.ip })
        //TODO:Retry

        const Server = new Connection(socket)

        Server.on('setup', () => { resolve(Server) })

        socket.on('error', rej)//TODO: err handling
    })
}

/////////////////////////
//END OF CLIENT REC
//START OF CLIENT HANDLING
/////////////////////////
