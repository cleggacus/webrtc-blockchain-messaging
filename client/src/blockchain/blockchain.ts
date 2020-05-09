import crypto from 'crypto';
import elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

class Message{
    addr: string;
    message: string;
    signature?: elliptic.ec.Signature;
    
    constructor(addr: string, message: string){
        this.addr = addr;
        this.message = message;
    }

    getHash(){
        const hash = crypto
            .createHash('sha512')
            .update(
                this.addr  +
                this.message
            ).digest('hex');
            
        return hash;
    }

    signMessage(signKey: elliptic.ec.KeyPair){
        const hashMessage = this.getHash();
        const sig = signKey.sign(hashMessage, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(!this.signature){
            throw new Error('message is not signed')
        }

        const pubKey = ec.keyFromPublic(this.addr, 'hex');
        return pubKey.verify(this.getHash(), this.signature);
    }
    
}

class Block{
    nonce: number;
    timestamp: string;
    messages: Message[];
    previousHash: string;
    hash: string;

    constructor(messages: Message[], previousHash = ''){
        this.timestamp = new Date().toString();
        this.messages = messages;
        this.previousHash = previousHash;
        this.hash = this.getHash();
        this.nonce = 0;
    }
    
    getHash(){
        const hash = crypto
            .createHash('sha512')
            .update(
                this.previousHash +
                this.timestamp +
                JSON.stringify(this.messages) + 
                this.nonce
            ).digest('hex');
        return hash;
    }

    mine(difficulty: number){
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join('0')){
            this.nonce ++;
            this.hash = this.getHash();
        }
    }

    hasValidMessage(){
        for(let i = 0; i < this.messages.length; i++){
            if(!this.messages[i].isValid()) return false;
        }

        return true;
    }
}

class Chain{
    difficulty: number;
    chain: Block[];
    pendingMessages: Message[];

    constructor(jsonChain: string = ''){
        if(!jsonChain){
            this.chain = [this.createGenBlock()];
            this.difficulty = 3;
            this.pendingMessages = [];
        }else{
            const jc = JSON.parse(jsonChain);
            for(let i = 0; i < jc.chain.length; i++){
                for(let j = 0; j < jc.chain[i].messages.length; j++){
                    jc.chain[i].messages[j] = Object.assign(new Message('',''), jc.chain[i].messages[j]);
                }
                jc.chain[i] = Object.assign(new Block([]), jc.chain[i]);
            }
            this.chain = jc.chain;
            this.difficulty = jc.difficulty;
            this.pendingMessages = jc.pendingMessages;
        }

    }

    createGenBlock(){
        return new Block([]);
    }

    getLastBlock(){
        return this.chain[this.chain.length-1];
    }
    
    minePendingMessages(){
        let block = new Block(this.pendingMessages, this.getLastBlock().hash);
        block.mine(this.difficulty);
        this.chain.push(block);
        this.pendingMessages = [];
    }

    getLast(){
        const blockMessages = this.chain[this.chain.length-1].messages;
        return blockMessages[blockMessages.length-1].message;
    }

    addMessage(message: Message){
        if(!message.addr){
            throw new Error('message must have addr')
        }

        if(!message.isValid()){
            throw new Error('message not valid');
        }

        this.pendingMessages.push(message);
    }

    isValid(){

        for(let i = 1; i < this.chain.length; i++){
            if(this.chain[i].previousHash !== this.chain[i-1].hash ||
                this.chain[i].hash !== this.chain[i].getHash() ||
                !this.chain[i].hasValidMessage())
                    return false;
        }

        return true;
    }
}

export {Block, Message, Chain};