import React, { Component } from 'react';
import './NotFound.css'
import { Link } from 'react-router-dom';

export default class NotFound extends Component {
    render() {
        return (
            <div className={"err"}>
                <h1>404</h1>
                <p>请确保地址正确</p>
                <div className={"err_but"}> <Link className='link' to='/home' >返回首页</Link> </div>
            </div>
        )
    }
}