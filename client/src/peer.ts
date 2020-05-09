import crypto from 'crypto';
import {generateRandomIP, xor, hexToBin, binGT} from './utils';
import {InitialConnection, Connection} from './webRTC';

class Peer{
    table: {
        id: string,
        connection: Connection
    }[];
    ip: string;
    port: number;
    id: string;
    tableIds: string[];
    onMes: (mes:string) => void;

    constructor(onMes: (mes:string) => void, idLength:number = 32){
        this.onMes = onMes;
        this.table = [];
        this.ip = generateRandomIP();
        this.port = Math.floor(Math.random()*1000);
        this.id = this.generateID(idLength);
        this.tableIds = this.getTableIds();
        this.initConn();
    }

    initConn(){
        let initConn = new InitialConnection(() => {
            console.log('chanel opened');
            const conn = initConn.toConnection((query, mes) => this.onMessage(query, mes));

            const data = {
                from: this.id,
                to: '',
                mes: this.id
            }

            this.table.push({
                id: '',
                connection: conn
            });

            this.table[this.table.length-1].connection.sendMessage('id', JSON.stringify(data));

            if(!conn.isInit){
                this.initConn();
            }
        }, () => {
            console.log('chanel closed');
        });
    
        initConn.connect();
    }

    sendMessage(query: string, mes: string, from:string, to: string){
        if(to == '*'){
            for(let i = 0; i < this.table.length; i ++){
                if(this.table[i].id != from){
                    const data = {
                        from: this.id,
                        to: to,
                        mes: mes
                    }
            
                    this.table[i].connection.sendMessage(query, JSON.stringify(data));
                }
            }
        }else{
            for(let i = 0; i < this.table.length; i ++){
                if(this.table[i].id != from){
                    const data = {
                        from: this.id,
                        to: to,
                        mes: mes
                    }
            
                    this.table[i].connection.sendMessage(query, JSON.stringify(data));
                }
            }
        }
    }

    findClosestNode(id:string, from:string){
        let clossestTable: number = 0;

        for(let i = 0; i < this.table.length; i ++){
            if(binGT(xor(id, this.table[clossestTable].id), xor(id, this.table[i].id))){
                clossestTable = i;
            }
        }

        if(binGT(xor(id, this.table[clossestTable].id), xor(id, this.id))){
            this.sendMessage('returnClosest', this.id, this.id, from)
        }else{
            const data = {
                from: this.id,
                to: id,
                mes: from
            }

            this.table[clossestTable].connection.sendMessage('findClosest', JSON.stringify(data));
        }
    }

    onMessage(query: string, mes: string){
        let data = JSON.parse(mes);

        switch(query){
            case 'id':
                this.table[this.table.length-1].id = data.mes;
                break;
            case 'mes':
                if(data.to == this.id){
                    console.log(`from: ${data.from}`);
                    console.log(`mes: ${data.mes}`);
                    this.onMes(data.mes);
                }else{
                    if(data.to == '*'){
                        console.log(data.mes);
                        this.onMes(data.mes);
                    }
                    this.sendMessage('mes', data.mes, data.from, data.to);
                }
                break;
        }
    }




    


    getTableIds(){
        let ids = [];

        for(let i = 0; i < this.id.length; i++){
            let distance = '0'.repeat(i) + '1' + '0'.repeat(this.id.length-i-1);
            ids.push(xor(distance, this.id));
        }

        return ids;
    }

    generateID(idLength:number){
        if(idLength > 160 || idLength <= 0){
            idLength = 160;
        }

        let id = hexToBin(crypto.createHash('sha1')
            .update(JSON.stringify({
                ip: this.ip,
                port: this.port
            }))
            .digest('hex'));
            
        return id.substr(0, idLength);
    }
}

export {Peer};