import {Chain, Message} from './blockchain';

const addMessage = (chainJson: string) => {
    return new Promise((resolve, reject) => {
        try{
            const chain = new Chain(chainJson);
            const lastMsg = chain.getLast();
            
            resolve(lastMsg)
        }catch(err){
            reject(err);
        }
    })
}

export default addMessage;