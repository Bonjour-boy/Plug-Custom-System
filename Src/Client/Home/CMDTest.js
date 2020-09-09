import React, { Component } from 'react';
import './CMDTest.css';
import '../Global.css';
import { Input, Button } from 'antd';
import axios from 'axios';
import { StatusCode } from '../../Config';

export default class CMDTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cmdStr: '',
            cmdResult: '',
            isRun: false
        }
    }

    onQuery() {
        const { cmdStr, isRun } = this.state;
        if (isRun === "") {
            alert("正在执行中")
            return;
        }

        if (cmdStr === "") {
            alert("cmd语句不能为空")
            return;
        }

        this.setState({
            cmdResult: '执行中',
            isRun: true
        }, () => {
            axios.post('/api/cmdtest', {
                cmd: cmdStr
            })
                .then(response => {
                    const { code, result } = response.data;
                    if (code === StatusCode.success.code) {
                        this.setState({
                            cmdResult: result.toString(),
                            isRun: false
                        })
                    }
                    else {
                        this.setState({
                            cmdResult: '查询错误:' + code,
                            isRun: false
                        })
                    }

                })
                .catch(error => {
                    this.setState({
                        cmdResult: '访问错误:' + error.toString(),
                        isRun: false
                    })
                })
        })
    }

    render() {
        const { cmdStr, cmdResult } = this.state;
        return (
            <div>
                <p>CMD语句:</p>
                <p>*只支持调试</p>
                <Input
                    value={cmdStr}
                    onChange={(e) => {
                        this.setState({
                            cmdStr: e.target.value
                        })
                    }}
                    onPressEnter={(e) => {
                        this.setState({
                            cmdStr: e.target.value
                        }, () => {
                            this.onQuery();
                        })
                    }}
                />
                <Button
                    type={'primary'}
                    className={"confirm_button"}
                    onClick={() => {
                        this.onQuery();
                    }}
                >
                    执行
                </Button>
                <p>{cmdResult}</p>
            </div>
        )
    }
}