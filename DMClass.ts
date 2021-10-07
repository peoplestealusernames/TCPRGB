import { EventEmitter } from 'events'
import { Connection } from './ConnectionClass'
import { readFileSync, writeFileSync } from 'fs'

export class DataManger extends EventEmitter {
    private Data: { [key: string]: any } = {}
    private FileLocation?: string

    constructor(Path?: string) {
        super()
        if (Path) {
            this.FileLocation = Path
            try {
                this.Data = JSON.parse(readFileSync(Path, 'utf-8'))
            } catch (e) {
                //console.log(e)
            }
        }
    }

    public Get(Path: string, ReqOut: boolean) {
        const Val = this.Data[Path]
        if (ReqOut)
            return JSON.stringify(new Request('PUT', Path, Val) as object)
        return Val
    }
    public Put(Path: string, Val: any, Save?: boolean) {
        this.Data[Path] = Val
        if (Save)
            this.UpdateFile()

        this.emit(Path, this.Get(Path, true))//TODO: call down the tree
    }

    public HandleReq(Req: Request, Client: Connection) {
        switch (Req.method) {
            case ('GET'):
                Client.write(this.Get(Req.path, true))
                break

            case ('PUT'):
                this.Put(Req.path, Req.data, Req.save)
                break

            case ('LISTEN'): //TODO: allow save on listen (only when server is told to save or always)
                const CB = Client.CB
                this.on(Req.path, CB)
                CB(this.Get(Req.path, true))
                Client.Listens.push({ path: Req.path, DM: this })
                break
        }
    }

    private StringToIndex() {
        //TODO: Impliment
    }
    private TableToIndex() {
        //TODO: impliment
    }

    private UpdateFile() {
        //TODO: Split into multiple files based on path to save lag
        if (!this.FileLocation)
            return

        writeFileSync(this.FileLocation, JSON.stringify(this.Data))
    }
}

//TODO: GetReq autohandling with the EventHandler.once event

export class Request {
    path: string
    method: 'GET' | 'PUT' | 'LISTEN'
    data?: any
    save?: boolean
    constructor(method: 'GET' | 'PUT' | 'LISTEN', path: string, data?: any, save?: boolean) {
        this.method = method
        this.path = path
        this.data = data
        this.save = save
    }
}

export function DataHandler(data: string | object, Client: Connection, DM: DataManger) {
    if (typeof (data) != 'object') {
        return
    }

    if (typeof (data) == 'object') {
        if (data.hasOwnProperty('method') && data.hasOwnProperty('path')) {
            const Req = data as Request
            DM.HandleReq(Req, Client)
        }
    }
}
