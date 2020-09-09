import { Divider, message, Modal, Radio, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import '../../Global.css';
import './index.js';
import RowEditableTable from './RowEditableTable';

const columns = [
    {
        title: '序号',
        dataIndex: 'key',
        width: 80,
        editable: false
    },
    {
        title: '故障码',
        dataIndex: 'code',
        width: 80,
        editable: true
    },
    {
        title: '中文标题',
        dataIndex: 'zh_title',
        width: 200,
        editable: true
    },
    {
        title: '中文详情',
        dataIndex: 'zh_detail',
        width: 200,
        editable: true
    },
    {
        title: '英文标题',
        dataIndex: 'en_title',
        width: 200,
        editable: true
    },
    {
        title: '英文详情',
        dataIndex: 'en_detail',
        width: 200,
        editable: true
    }
];

@inject('stores')
@observer
export default class FaultManager extends Component {
    state = {
        modalShow: false,
        tableData: []
    };

    show(id) {
        this.props.stores.faultCodeDetails.getData(id);
        this.setState({ modalShow: true, tableData: [] });
    }

    _setFaultType = e => {
        this.props.stores.faultCodeDetails.setFaultType(e.target.value);
    };

    _changeTableData = tableData => {
        this.setState({ tableData });
    };

    submit = () => {
        const { tableData } = this.state;
        if (tableData.length > 0) {
            this.props.stores.faultCodeDetails.update(tableData);
            this.setState({ modalShow: false });
        } else {
            message.warn('请添加一条故障');
        }
    };

    cancel = () => {
        this.setState({ modalShow: false });
    };

    render() {
        const { faultCodeDetails } = this.props.stores;
        const { faultType, loading, datas } = faultCodeDetails;
        const { modalShow } = this.state;
        return (
            <Modal
                visible={modalShow}
                onOk={this.submit}
                onCancel={this.cancel}
                maskClosable={false}
                okText="确认"
                cancelText="取消"
                width={1200}
            >
                <Spin tip="Loading..." spinning={loading}>
                    <Radio.Group
                        onChange={this._setFaultType}
                        value={faultType}
                    >
                        <Radio value="bit_">bit位</Radio>
                        <Radio value="error_">error码</Radio>
                    </Radio.Group>
                    <Divider />
                    <RowEditableTable
                        addButton
                        columns={columns}
                        dataSource={datas}
                        onChange={this._changeTableData}
                    />
                </Spin>
            </Modal>
        );
    }
}
