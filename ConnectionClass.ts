import { Socket } from 'net'
import { KeyObject, createPrivateKey } from 'crypto'
import { Encrypt, Decrypt, GenKeysSync } from './crypto'
import { EventEmitter } from 'events'

interface ConnectionEvents {
    'data': (data: object | string) => void;
    'setup': () => void
}

export declare interface Connection {
    on<U extends keyof ConnectionEvents>(
        event: U, listener: ConnectionEvents[U]
    ): this;

    emit<U extends keyof ConnectionEvents>(
        event: U, ...args: Parameters<ConnectionEvents[U]>
    ): boolean;
}

export class Connection extends EventEmitter {
    public socket: Socket

    public publicKey: string
    private privateKey: string
    public privateKeyObj: KeyObject

    public remotePublicKey?: string
    public RecHandShake = false
    public Encrypted = false

    public Listens: { DM: EventEmitter, path: string }[] = []

    public constructor(socket: Socket) {
        super()
        this.socket = socket
        const Keys = GenKeysSync()
        this.publicKey = Keys.publicKey
        this.privateKey = Keys.privateKey
        this.privateKeyObj = createPrivateKey({
            //TODO: Formating in file
            key: this.privateKey,
            type: 'pkcs8',
            format: 'pem',
            //TODO:Passphrase
            passphrase: 'top secret',
        })

        SetUpSocket(this)

        this.CB = this.CB.bind(this)
    }

    public write(msg: string, CallBack?: (err?: Error) => void) {
        if (!this.remotePublicKey) {
            throw new Error("Public key not recived wait for 'setup'")
        }
        const Send = Encrypt(this.remotePublicKey, msg)

        this.socket.write(Send, CallBack)
    }

    public CB(data: object | string) {
        if (typeof data != 'string')
            data = JSON.stringify(data)

        this.write(data, console.log)//TODO: error handling
    }
}

function SetUpSocket(Client: Connection) {
    Client.socket.on('close', (HadErr) => {
        for (const k of Client.Listens) {
            k.DM.off(k.path, Client.CB)
        }
        console.log('Closed connection ' + Client.socket.remoteAddress + ":" + Client.socket.remotePort?.toString())
    })

    Client.socket.on('data', (data) => {
        if (Client.Encrypted) {
            var msg = Decrypt(Client.privateKeyObj, data).toString()
            try { msg = JSON.parse(msg) } catch (e) { }
            Client.emit('data', msg)
        } else {
            //TODO: if condition is not validated ping back
            //TODO: make public key less obvious ie remove begin and .Pub
            try {
                const Payload = JSON.parse(data.toString())
                if (Payload.Pub) {
                    Client.remotePublicKey = Payload.Pub
                    Client.socket.write("PUBREC") //TODO: send ack encypted
                }
            } catch (err) {
                if (data.toString() === "PUBREC") {
                    Client.RecHandShake = true
                } else {
                    console.log(err)
                }
            } //TODO: ERR handling and drop Connectionion if fails
            if (Client.remotePublicKey && Client.RecHandShake) {
                Client.Encrypted = true
                Client.emit('setup')
            }
        }
    })

    const PubKeySend = JSON.stringify({ Pub: Client.publicKey })
    Client.socket.write(PubKeySend)
}
