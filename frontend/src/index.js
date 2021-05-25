import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Router,Switch,Route} from 'react-router-dom';
import history from './components/history';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Blocks from'./components/blocks';
import Transactionpool from './components/transactionpool';


ReactDOM.render(
  <React.StrictMode>
    <Router history={history} >
          <Switch>
            <Route exact path="/" component={App} />
            <Route exact path="/blocks" component={Blocks} />
            <Route exact path="/transactionpool" component={Transactionpool} />
          </Switch>
        </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();