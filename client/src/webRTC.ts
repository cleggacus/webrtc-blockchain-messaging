import openSocket from 'socket.io-client';
const socket = openSocket('http://127.0.0.1:3001');

class InitialConnection{
    connection: RTCPeerConnection;
    channel: RTCDataChannel;
    openChannel: boolean;
    socketId: string;
    isInit: boolean;

    onOpen: Function;
    onClose: Function;

    constructor(onOpen = () => {}, onClose = () => {}){
        this.connection = new RTCPeerConnection();
        this.channel = new RTCPeerConnection().createDataChannel('send');
        this.openChannel = false;
        this.socketId = '';
        this.isInit = false;
        
        this.onOpen = onOpen;
        this.onClose = onClose;
    }

    connect(){
        socket.emit('socket', true);

        socket.on('socket', (data: any) => {
            if(!this.socketId){
                if(data.init){
                    socket.emit('socket', false);
                    this.socketId = data.id;
                    this.connectInit();
                }else{
                    this.socketId = data.id;
                    this.connectNoInit();
                }
            }
        })
    }

    connectInit(){
        this.isInit = true;
        this.channel = this.connection.createDataChannel('send');

        this.channel.onopen = () => {this.onOpen(); this.openChannel = true;};
        this.channel.onclose = () => this.onClose();

        this.connection.createOffer()
            .then(offer => {
                this.connection.setLocalDescription(offer);
                socket.emit('sendOffer', {
                    id: this.socketId,
                    offer: offer
                });
            })

        this.connection.onicecandidate = e => {
            if(e.candidate){
                socket.emit('sendCandidate', {
                    id: this.socketId,
                    candidate: e.candidate
                });
            }
        }

        socket.on('getOffer', (data:any) => {
            if(!this.openChannel){
                this.connection.setRemoteDescription(data);
            }
        })

        socket.on('getCandidate', (data:any)=> {
            if(!this.openChannel){
                this.connection.addIceCandidate(data);
            }
        })
    }

    connectNoInit(){
        this.connection.ondatachannel = e => {
            this.channel = e.channel;
            this.channel.onopen = () => {this.onOpen(); this.openChannel = true;};
            this.channel.onclose = () => this.onClose();
        }

        this.connection.onicecandidate = e => {
            if(e.candidate){
                socket.emit('sendCandidate', {
                    id: this.socketId,
                    candidate: e.candidate
                });
            }
        }

        socket.on('getOffer', (data:any) => {
            if(!this.openChannel){
                this.connection.setRemoteDescription(data)
                    .then(() => this.connection.createAnswer())
                    .then((answer:any) => {
                        this.connection.setLocalDescription(answer);
                        socket.emit('sendOffer', {
                            id: this.socketId,
                            offer: answer
                        })
                    });
            }
        });

        socket.on('getCandidate', (data:any)=> {
            if(!this.openChannel){
                this.connection.addIceCandidate(data);
            }
        });
    }

    toConnection(onMessage: (query:string, mes:string) => void){
        let connection = new Connection(onMessage);

        this.channel.onmessage = (e) => {
            const d = JSON.parse(e.data)
            connection.onMessage(d.query, d.data);
        };

        connection.connection = this.connection
        connection.channel = this.channel;
        connection.openChannel = this.openChannel;
        connection.isInit = this.isInit;

        return connection;
    }
}

class Connection{
    connection: RTCPeerConnection;
    channel: RTCDataChannel;
    openChannel: boolean;
    isInit: boolean;
    onMessage: (query:string, mes:string) => void;

    constructor(onMessage: (query:string, mes:string) => void){
        this.connection = new RTCPeerConnection();
        this.channel = new RTCPeerConnection().createDataChannel('send');
        this.openChannel = false;
        this.onMessage = onMessage;
        this.isInit = false;
    }
    
    sendMessage(query:string, data:any){
        this.channel.send(JSON.stringify({
            query: query,
            data: data
        }));
    }
}

export {InitialConnection, Connection};