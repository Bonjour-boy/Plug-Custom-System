import React, { Component } from 'react';
import { message, Button, Select, DatePicker,Table} from 'antd';
import { Platform, StatusCode, DevicesPlatform } from '../../Config';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import axios from 'axios';
const LEVEL_COLOR = {
    "[TRACE]":"#2F83CD",
    "[DEBUG]":"#328881",
    "[INFO]":"#81931B",
    "[WARN]":"#A27D28",
    "[ERROR]":"#CB333E",
    "[FATAL]":"#B43B7B"
};
const columns = [
    {title : '时间',dataIndex : 'date',key : 'date',render: text => <span>{text}</span>,width : 162},
    {
        title : '级别',dataIndex : 'level',key : 'level',width : 80,
        render : (text,row) => <span style={{fontWeight:'bolder',color:row.color}}>{text}</span>
    },
    {title : '类型',dataIndex : 'type',key : 'type',width : 100},
    {title : '内容',dataIndex : 'content',key : 'content'}
];
@inject('stores')
@observer
export default class PlugLogList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            type : 'all',
            searchDate : moment(),
            logContent : '',
            data : []
        }
    }
    onChange(date, dateString){
        this.setState({
            searchDate : date
        });
    }
    search(){
        var dateStr = this.state.searchDate.format("YYYY-MM-DD");
        if(dateStr === moment().format("YYYY-MM-DD")){
            dateStr = 'today';
        }
        var param = {
            type : this.state.type,
            dateStr : dateStr
        };
        axios.get(
            '/api/getLog',
            {
                params : param
            },
            {
                headers: {
                    authorization_v1: 'null',
                },
            }
        )
        .then((response) => {
            const { code, result } = response.data;
            if (code === StatusCode.success.code) {
                var reuslt = response.data.result;
                var list = result.split("\n");
                var data = [];
                list.forEach((str,i) => {
                    var color = LEVEL_COLOR['[DEBUG]'];
                    if(str.indexOf(" - ") === -1){
                        var target = data[data.length - 1];
                        if(target){
                            target.content += ("\n" + str);
                        }else{
                            data.push({
                                key : i,
                                color,
                                date : '',
                                level : '',
                                type : '',
                                content : str
                            });
                        }
                    }else{
                        var infoArr = str.split(" - ");
                        var name = infoArr.shift();
                        var nameArr = name.split(" ");
                        for(var j in LEVEL_COLOR){
                            if(str.indexOf(j) !== -1){
                                color = LEVEL_COLOR[j];
                                break;
                            }
                        }
                        data.push({
                            key : i,
                            color,
                            date : nameArr[0].replace(/[\[\]]/g,'').replace("T"," ").replace(/\.[\d]+$/,''),
                            level : nameArr[1].replace(/[\[\]]/g,''),
                            type : nameArr[2].replace(/[\[\]]/g,''),
                            content : infoArr.join(" - ")
                        });
                    }
                });
                data.reverse();
                this.setState({
                    data
                });
                // var arr = result.split("\n").reverse();
                // var html = [];
                // arr.forEach((str) => {
                //     var color = '#328881';
                //     for(var i in LEVEL_COLOR){
                //         if(str.indexOf(i) !== -1){
                //             color = LEVEL_COLOR[i];
                //             break;
                //         }
                //     }
                //     html.push("<div style='color:"+color+"'>"+str+"</div>");
                // });
                // this.setState({
                //     logContent : html.join("")
                // });
                /*<div style={{minHeight:400,backgroundColor:'#000',marginTop:10}} dangerouslySetInnerHTML={logHtml}>
                </div>*/
            } else {
                message.error('获取失败');
            }
        })
        .catch((e) => {
            console.log(e);
            message.error('获取失败');
        });
    }
    render() {
        // var logHtml = {__html : this.state.logContent};
        return (
            <div>
                <div>
                    日志类型：
                    <Select defaultValue='all' value={this.state.type} style={{width:120}} onChange={(value) => {
                        this.setState({type : value});
                    }}>
                        <Select.Option value="all">all</Select.Option>
                        <Select.Option value="error">error</Select.Option>
                        <Select.Option value="httpAccess">httpAccess</Select.Option>
                    </Select>
                    <DatePicker onChange={this.onChange.bind(this)} style={{marginLeft:10,marginRight:10}}
                        value={this.state.searchDate}/>
                    <Button type="primary" onClick={this.search.bind(this)}>查询</Button>
                </div>
                <Table columns={columns} dataSource={this.state.data} pagination={{pageSize : 50}}/>
            </div>
        );
    }
}