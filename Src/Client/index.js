import React from 'react';
import ReactDOM from 'react-dom';
import { routers } from './Router'
import Home from './Home';
import './index.css';

import { HashRouter as Router, Route, Switch, Redirect, NavLink } from 'react-router-dom';

import stores from './Store';
import { configure } from 'mobx'; // 开启严格模式
import { Provider } from "mobx-react"
configure({ enforceActions: 'observed' }) // 开启严格模式

class Routers extends React.Component {
    render() {
        return (
            <Provider stores={stores}>
                <Router>
                    <div className='head'>
                        <NavLink activeClassName='active' to='/login'>登录</NavLink>
                        <NavLink activeClassName='active' to='/home'>首页</NavLink>
                    </div>
                    <Switch>
                        {
                            routers.map((item, i) => {
                                return <Route exact strict key={i} path={item.path} component={item.component} />
                            })
                        }
                        <Route path='/home' component={Home} />
                        <Redirect path='/*' to='/404' />
                    </Switch>
                </Router>
            </Provider>
        )
    }
}

ReactDOM.render(<Routers />, document.getElementById('root'));