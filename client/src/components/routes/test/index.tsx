import React from 'react';
import './index.scss';
import {Peer} from '../../../peer';
import elliptic from 'elliptic';
import {Message,Chain,Block} from '../../../blockchain/blockchain'; 
import initializeChain from '../../../blockchain/initialize'; 
import addMessage from '../../../blockchain/addMessage'; 
import getLastMessage from '../../../blockchain/getLastMessage'; 

interface IState {
  messages: JSX.Element[];
  chain: string;
  key: elliptic.ec.KeyPair;
}

class Test extends React.Component<{}, IState>{
  peer: Peer;

  constructor(props: any){
    super(props);
    const chain = new Chain();
    const ec = new elliptic.ec('secp256k1');

    this.peer = new Peer((mes:string) => {
      this.fetchLog(mes);
    });

    this.state = {
      messages: [],
      chain: JSON.stringify(chain),
      key: ec.genKeyPair()
    }
  }

  fetchLog(msg: string){
    console.log(msg);
    const newChain = new Chain(msg);
    
    if(newChain.isValid()){
      const currentMessages = this.state.messages;

      this.setState({
        chain: JSON.stringify(newChain)
      }, () => {
        getLastMessage(this.state.chain).then((mes) => {
          currentMessages.push(<p className='fetched'>{mes as string}</p>);
          this.setState({
            messages: currentMessages
          });
        }).catch((err:string) => {
          this.errLog(err);
        })
      });
    }else{
      this.errLog('received chain not valid')
    }
  }
  
  sendLog(msg: string){
    const currentMessages = this.state.messages;
    currentMessages.push(<p className='sent'>{msg}</p>);
    this.setState({
      messages: currentMessages
    });
  }
  
  errLog(msg: string){
  const currentMessages = this.state.messages;
    currentMessages.push(<p className='err'>{msg}</p>);
    this.setState({
      messages: currentMessages
    });
  }
  
  log(msg: string){
  const currentMessages = this.state.messages;
    currentMessages.push(<p className='log'>{msg}</p>);
    this.setState({
      messages: currentMessages
    });
  }

  sendMessage(e:React.KeyboardEvent) {
    let mesIn: HTMLInputElement|null = document.querySelector('#message-input');

    if(e.key == 'Enter' && mesIn){
      addMessage(this.state.key, mesIn.value, this.state.chain).then((res) => {
        this.setState({
          chain: res as string
        }, () => {
          this.peer.sendMessage('mes', this.state.chain, this.peer.id, '*');
          getLastMessage(this.state.chain).then((mes) => {
            this.sendLog(mes as string);
            if(mesIn)
              mesIn.value = '';
          }).catch((err:string) => {
            this.errLog(err);
          })
        });
      }).catch((err: string) => {
        this.errLog(err);
      })
    }
  }

  componentDidMount(){
    this.log(this.peer.id);
  }

  render(){
    return(
      <div className="test">
        <div className="content">
          {this.state.messages}
        </div>

        <div className="inputs">
          <input onKeyUp={(e) => this.sendMessage(e)} name="message" placeholder="message" id="message-input" type="text" />
        </div>
      </div>
    )
  }
}

export default Test;