import React from 'react';
import { secrouter } from '../Router';
import { HashRouter as Rputer, Route, Redirect, Switch } from 'react-router-dom';
import Home from './Home';

function App() {
    return (
        <Home>
            <Switch>
                {secrouter.map((item, i) => {
                    return <Route exact strict key={i} path={item.path} component={item.component} />
                })}
                <Redirect exact path='/' to='/home/productList' />
                <Redirect exact from='/home' to='/home/productList' />
                <Redirect path='/home/*' to='/404' />
            </Switch>
        </Home>
    )
}

export default App