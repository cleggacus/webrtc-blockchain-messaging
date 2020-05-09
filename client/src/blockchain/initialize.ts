import {Chain} from './blockchain';

const initialize = () => {
    return new Promise((resolve, reject) => {
        try{
            const chain = new Chain();
            resolve(JSON.stringify(chain));
        }catch(err){
            reject(err);
        }
    })
}

export default initialize;