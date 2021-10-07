import { KeyObject, generateKeyPairSync, generateKeyPair, privateDecrypt, publicEncrypt, createPrivateKey } from "crypto";

export function GenKeysSync(modulusLength = 1024) {
    return generateKeyPairSync("rsa", {
        modulusLength,
        //TODO:format from file
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            //TODO:passphrase
            passphrase: 'top secret'
        }
    });
}

export function GenKeys(modulusLength = 1024): Promise<{ publicKey: string, privateKey: string }> {
    return new Promise((res, rej) => {
        generateKeyPair("rsa", {
            modulusLength,
            //TODO:format from file
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                //TODO:passphrase
                passphrase: 'top secret'
            }
        }, (err: any, publicKey: string, privateKey: string) => {
            if (err) { rej(err) }
            res({ publicKey, privateKey })
        });
    })
}

export function Encrypt(publicKey: string, Text: string) {
    return publicEncrypt(publicKey, Buffer.from(Text, "utf8"))
}

export function Decrypt(privateKey: string | KeyObject, Data: NodeJS.ArrayBufferView) {
    if (typeof (privateKey) == 'string') {
        privateKey = createPrivateKey({
            //TODO:format from file
            key: privateKey,
            type: 'pkcs8',
            format: 'pem',
            //TODO:passphrase
            passphrase: 'top secret',
        })
    }
    return privateDecrypt(privateKey, Data).toString()
}

//Test()
async function Test() {
    const Keys = await GenKeys()
    //const Keys = { "publicKey": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxLOpkcx2x7ZWJcD5z5EnI6RRB\nOo6ybEccBbrMk5qcgZwrHBPHc/46/OhpIZq5vK3ASmTilBZ8anWytn3wWx9TGVCu\nqhGeorYasDSZlAnaAV3+gI1qC7OuvFwzzgvhgTE8MMlF66Dhu1lfVon0zjBDNEZ7\nOsnOObNS4YN4/it92QIDAQAB\n-----END PUBLIC KEY-----\n", "privateKey": "-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIC3TBXBgkqhkiG9w0BBQ0wSjApBgkqhkiG9w0BBQwwHAQItznGN88FBW4CAggA\nMAwGCCqGSIb3DQIJBQAwHQYJYIZIAWUDBAEqBBDbWXoV4+AzdxHulNVqXAiXBIIC\ngHKZlAWLNMmAxuYiIS+qlZUfooks22IgHV1uz6bF7TgvmB0tkrls3IgV84Y2Snvn\nG6Go+GkveGBfMKzThMlm56eip6oJmdV1MUgK2Ak0fBF+Wz+QGJP+awXkBwY9CgZa\ncIo36RTT49f+SgBeVA98uGL6wx9ZvLLASA8COhre3LRQBLteoWhUzMKR0JBaU7aL\nDsAFskTTGKOuqDmiVU0OwHy0KS0CGovUccA9bPvFp5ui5rSpjx5wNccAkrEYrvD3\n0r/e56cnaegzRVA0ark3V72A7KgzZ5/oQojpRzrLr6nKTp3hpJdDxHA7f7n8r/av\ns+mp/wCc7rbzOmsVQ+jirjg1QKUVlIm0oYj1+EEcWXfdQ3DSnj7gl2ZEuzPUW2rY\n6m0Yj5UHMujrJX0+Vr9ksaGPC7TJ8DDGrCTph19SnrtWJguaqMCkPXu5Wo+Djlg6\n6xZi0V2+PkvckjmExVmGYqasmV7HsOZfdW+oJLOZPFnmgpIfiRbj0niNTO5w6U6f\n9p/JQaHIKUAbIXLA3Z2cFAnqhuIMfw2uCCYTHV6GyIphvuUdFI2EkF2SLQEQBoPJ\npHR5hkqeDuY6VtXIGot4sQXmDUoG+qVZvFcUx4jAZvilpEuRE2fAOs7l3olDCBNV\nfy3VtYTLFi0AsqBnn3Wl2NifPOUecg5Hq39lOuH9F1dIgQCtfpSzrumnbJYbvQ6v\numTSQX33/+pGcIlK1F8fymy2bh2WBvG2BIlzF7YfU9i+vjn10lnRs95jTmHDRB/s\n1rSp8QwAdu3I9MlY6+sr5zFWkwQHMZV1XtVdPiIk4MI/I5Gn9mH5YOla2n+rzj+m\nAPhuziozQ2ZOx8uAsQO2TSA=\n-----END ENCRYPTED PRIVATE KEY-----\n" }
    const Text = "test"
    const Msg = Encrypt(Keys.publicKey, Text)
    const Rec = Decrypt(Keys.privateKey, Msg)
    console.log(Text, '\n', Msg, '\n', Rec)
}