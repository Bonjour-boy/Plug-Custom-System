import React, { Component } from 'react';
import './DBTest.css';
import '../Global.css';
import { Input, Button } from 'antd';
import axios from 'axios';
import { StatusCode } from '../../Config';

export default class DBTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sqlStr: '',
            sqlResult: '',
            isQuery: false
        }
    }

    onQuery() {
        const { sqlStr, isQuery } = this.state;
        if (isQuery === "") {
            alert("正在执行中")
            return;
        }

        if (sqlStr === "") {
            alert("sql语句不能为空")
            return;
        }


        const sqlTest = sqlStr.toUpperCase();
        if (
            sqlTest.indexOf("DELETE") !== -1 ||
            sqlTest.indexOf("REPLACE") !== -1 ||
            sqlTest.indexOf("CREATE") !== -1 ||
            sqlTest.indexOf("ALTER") !== -1 ||
            sqlTest.indexOf("DROP") !== -1 ||
            sqlTest.indexOf("RENAME") !== -1 ||
            sqlTest.indexOf("INSERT") !== -1 ||
            sqlTest.indexOf("UPDATE") !== -1 ||
            sqlTest.indexOf("TRUNCATE") !== -1
        ) {

            alert("不支持此sql语句")
            return
        }

        this.setState({
            sqlResult: '执行中',
            isQuery: true
        }, () => {
            axios.post('/api/dbtest', {
                sql: sqlStr
            })
                .then(response => {
                    const { code, result } = response.data;
                    if (code === StatusCode.success.code) {
                        this.setState({
                            sqlResult: '查询成功:' + result.toString(),
                            isQuery: false
                        })
                    }
                    else {
                        this.setState({
                            sqlResult: '查询错误:' + code,
                            isQuery: false
                        })
                    }

                })
                .catch(error => {
                    this.setState({
                        sqlResult: '访问错误:' + error.toString(),
                        isQuery: false
                    })
                })
        })
    }

    render() {
        const { sqlStr, sqlResult } = this.state;
        return (
            <div>
                <p>SQL语句:</p>
                <p>*只支持SELECT查询操作，不支持其他危险操作</p>
                <Input
                    value={sqlStr}
                    onChange={(e) => {
                        this.setState({
                            sqlStr: e.target.value
                        })
                    }}
                    onPressEnter={(e) => {
                        this.setState({
                            sqlStr: e.target.value
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
                <p>{sqlResult}</p>
            </div>
        )
    }
}