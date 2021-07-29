import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import MainPage from './pages/MainPage';
import SignPage from './pages/SignPage';
import './App.css';

class App extends Component {

  render() {
    return (
      <BrowserRouter>
        <div className="App">   
          <Switch>
            <Route exact path="/" component={MainPage}/>
            <Route path="/login" component={SignPage}/>
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}
export default App;

