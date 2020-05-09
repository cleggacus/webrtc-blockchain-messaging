import {Chain, Message} from './blockchain';
import ellipic from 'elliptic';

const addMessage = (key: ellipic.ec.KeyPair, msg: string, chainJson: string) => {
    return new Promise((resolve, reject) => {
        try{
            const chain = new Chain(chainJson);
            const message = new Message(key.getPublic('hex'), msg);
    
            message.signMessage(key);
            chain.addMessage(message);
            chain.minePendingMessages();
    
            if(chain.isValid()){
                resolve(JSON.stringify(chain));
            }else{
                reject('chain not valid');
            }
        }catch(err){
            reject(err);
        }
    })
}

export default addMessage;