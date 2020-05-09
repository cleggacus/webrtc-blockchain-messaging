import React from 'react';
import './index.scss';
import defaultPic from '../../assets/default-profile.png';
import {Theme} from '../themes';

import {Sun, Moon, Circle, Grid} from 'react-feather'

interface IProps{
  theme: Theme;
  toggleTheme: Function;
}

class Navbar extends React.Component<IProps>{
  constructor(props: IProps){
    super(props);
  }

  toggleMenu(){
    const menu: any = document.querySelector('.menu');
    menu.classList.toggle('active');
  }

  render(){
    return(
      <div id="header">
        <div className="search">
          <input name="search" placeholder="Search" type="text"></input>
        </div>

        <div className="profile">
          <img src={defaultPic}></img>
        </div>

        <div onClick={() => this.toggleMenu()} className="menu-icon">
          <Grid />
        </div>

        <div className="menu">

        </div>

        <div onClick={() => this.props.toggleTheme()} className="theme-change">
          <div className={this.props.theme.title==='light' ? "active": ""} ><Sun /></div>
          <div className={this.props.theme.title==='dark' ? "active": ""} ><Moon /></div>
          <div className={this.props.theme.title==='black' ? "active": ""} ><Circle /></div>
        </div>
      </div>
    )
  }
}

export default Navbar;