import React from 'react';
import './index.scss';

import {BrowserRouter, Switch, Route} from 'react-router-dom';
 
import Navbar from './navbar';
import Test from './routes/test';
import {Theme, Themes, setTheme} from './themes';

interface IState{
  theme: Theme
}

class App extends React.Component<{}, IState>{
  constructor(props: Readonly<{}>){
    super(props);
    this.state = {
      theme: Themes.dark
    }
  }

  toggleTheme(){
    const isBlack = this.state.theme === Themes.black;
    const isDark = this.state.theme === Themes.dark;

    this.setState({
      theme: isBlack ? Themes.light : (isDark ? Themes.black : Themes.dark)
    });
  }
  
  render(){
    setTheme(this.state.theme);

    return(
      <div id="app">
        <BrowserRouter>
          <Navbar theme={this.state.theme} toggleTheme={() => this.toggleTheme()} ></Navbar>

          <div id="content">
            <Switch>
              <Route exact path="/" component={Test} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
