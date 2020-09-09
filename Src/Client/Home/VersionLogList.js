import React, { Component } from 'react';
import './VersionLogList.css';
import '../Global.css';
import { Timeline } from 'antd';
import { VersionLogs } from '../../Config';

const logsCount = 20;

export default class VersionLogList extends Component {
    constructor(props) {
        super(props);

        this.logList = VersionLogs;

        if (VersionLogs.length > logsCount) {
            for (let i = 0; i < logsCount; i++) {
                const element = VersionLogs[i];
                this.logList.push(element);
            }
        }
    }

    renderTimelineItem(item, index) {
        const { version, date, descs } = item;
        const color = (index === 0 ? "green" : "gray");
        return (
            <Timeline.Item key={index} color={color}>
                <p>
                    <span><b>{"v" + version + "    -    "}</b></span>
                    <span>{date}</span>
                </p>
                {
                    descs.map((item_2, index_2) => {
                        return <p key={index_2}>{item_2}</p>
                    })
                }
            </Timeline.Item>
        )
    }

    render() {
        return (
            <div>
                <Timeline>
                    {
                        this.logList.map((item, index) => {
                            return this.renderTimelineItem(item, index);
                        })
                    }
                </Timeline>
            </div>
        )
    }
}