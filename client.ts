import { Connection } from "./ConnectionClass"
import { DataHandler, DataManger, Request } from "./DMClass"
import { GetSocket } from "./ClientAPI"
import serialport from "serialport"

const port = new serialport('COM5', {
    baudRate: 9600,
    lock: false
})

var PortOpen = false
port.on('open', () => {
    PortOpen = true;
    var data = { r: 0, g: 0, b: 0 };
    WriteRGB(data);
})

start()
async function start() {
    const Server = await GetSocket()
    Server.write(JSON.stringify(Send))
    Server.on('data', (msg) => DataRec(msg, Server))
}

/*const Send: Request = {
    method: 'PUT',
    path: 'test',
    data: 'Aye',
    save: true
}*/
//const Send = {    method: 'PUT',    path: 'test',    data: 'Aye',    save: true}
//const Send = {    method: 'GET',    path: 'test',    data: 'Aye',    save: true}

const Send: Request = new Request('LISTEN', 'RGB')

const DM = new DataManger('./Pass/ClientData.json')
DM.on('RGB', WriteRGB)

function DataRec(data: string | object, Client: Connection) {
    console.log(data);
    if (data === 'PING') {
        Client.write('PONG')
    }

    DataHandler(data, Client, DM)
}

async function WriteRGB(data: any) {
    if (typeof data == 'string') {
        data = JSON.parse(data)
        data = data.data
    }

    console.log(data, PortOpen)
    if (PortOpen) {
        if (!data.r || !data.g || !data.b)
            return
        var write = "\n"
        write += ("|r" + data.r)
        write += ("|g" + data.g)
        write += ("|b" + data.b)
        write += "|\n"
        port.write(write)
    }
}
