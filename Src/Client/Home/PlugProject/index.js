import React, { Component } from 'react';
import { message, Button, Modal, Table, Tag, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './index.css';
import { PluginStatus, StatusCode } from '../../../Config';
import { FormatUnit } from '../../../Unit';
import { observer, inject } from 'mobx-react';
import PlugPackageEditor from './PlugPackageEditor';
import axios from 'axios';

@inject('stores')
@observer
export default class PlugPackageList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            packageEditorLoading: false,
            packageEditorVisible: false,
            paramsEditorVisible: false,
            data: null
        }

        this.columns = [
            {
                title: '品类',
                dataIndex: 'categoryId',
                key: 'categoryId',
                render: (id) => {
                    return this.getCategoryNameById(id)
                }
            },
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '项目包名称',
                dataIndex: 'projectName',
                key: 'projectName',
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status) => {
                    return this.getStatusName(status);
                }
            },
            {
                title: 'Git更新信息',
                dataIndex: 'last_update_msg',
                key: 'last_update_msg',
            },
            {
                title: 'Git更新时间',
                dataIndex: 'last_update_date',
                key: 'last_update_date',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => (
                    <div className="flex-column">
                        <Button
                            onClick={() => {
                                this.onShowPackageEditor(record);
                            }}
                        >
                            {'更新'}
                        </Button>
                        <Button
                            danger
                            className={"button-margin-top"}
                            onClick={() => {
                                Modal.confirm({
                                    title: '删除插件信息',
                                    content: (
                                        <div>
                                            <p>是否确认删除该插件的配置信息和相关参数</p>
                                        </div>
                                    ),
                                    onOk: () => {
                                        this.deleteData(record);
                                    },
                                    okText: '确定',
                                    cancelText: '取消'
                                });

                            }}
                        >
                            {'删除'}
                        </Button>
                    </div>
                ),
            }
        ];
    }

    getCategoryNameById(id) {
        const { datas } = this.props.stores.categorys;

        for (let i = 0; i < datas.length; i++) {
            const element = datas[i];
            if (element.id === id) {
                return (
                    <Tag color={'blue'}>
                        {element.comment}
                    </Tag>
                );
            }
        }

        return (
            <Tag>
                {'未加载'}
            </Tag>
        );
    }

    getStatusName(status) {
        if (FormatUnit.isNullOrEmpty(status)) {
            return (
                <Tag>
                    {'无'}
                </Tag>
            );
        }

        switch (status) {
            case PluginStatus.idle: {
                return (
                    <Tag color={'lime'}>
                        {'闲置中'}
                    </Tag>
                );
            }
            case PluginStatus.waiting: {
                return (
                    <Tag color={'gold'}>
                        {'等待中'}
                    </Tag>
                );
            }
            case PluginStatus.packaging: {
                return (
                    <Tag color={'geekblue'}>
                        {'打包中'}
                    </Tag>
                );
            }
        }


    }

    updatePluginInfo() {
        this.setState({
            packageEditorLoading: true
        }, () => {
            const data = this.packageEditor.returnData();
            axios.post('/api/v1/updatePluginProject', data)
                .then((response) => {
                    console.log(response)
                    const { code } = response.data;
                    if (code == StatusCode.success.code) {
                        message.success('操作成功');
                    }
                    else {
                        message.error('操作失败');
                    }

                    this.setState({
                        packageEditorLoading: false,
                        packageEditorVisible: false
                    });

                    this.props.stores.pluginProjects.getData();
                })
                .catch((error) => {
                    message.error('操作失败');
                    this.setState({
                        packageEditorLoading: false,
                        packageEditorVisible: false
                    });

                    this.props.stores.pluginProjects.getData();
                });
        })
    }

    onShowPackageEditor(data) {
        this.setState({
            packageEditorVisible: true,
            data: data
        })
    }

    onHidePackageEditor() {
        this.setState({
            packageEditorVisible: false
        })
    }

    deleteData(data) {
        this.props.stores.pluginProjects.deleteData(data.id)
        this.props.stores.pluginProjects.getData();
        this.setState({
            data: data
        })
    }

    render() {
        const {
            packageEditorLoading,
            packageEditorVisible,
            paramsEditorVisible,
            paramsEditorLoading,
            data
        } = this.state;
        const { pluginProjects } = this.props.stores;

        return (
            <div>
                <div className="flex-row">
                    <Button
                        type={'primary'}
                        onClick={() => {
                            this.onShowPackageEditor(null);
                        }}
                    >
                        新建
                    </Button>
                </div>
                <Table
                    className={"margin-top"}
                    dataSource={pluginProjects.datas}
                    bordered={true}
                    columns={this.columns}
                    loading={pluginProjects.loading}
                />
                <Modal
                    title="插件包信息"
                    visible={packageEditorVisible}
                    onOk={() => {
                        this.updatePluginInfo();
                    }}
                    onCancel={() => {
                        this.onHidePackageEditor();
                    }}
                    confirmLoading={packageEditorLoading}
                    okText={"确定"}
                    cancelText={"取消"}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                    <PlugPackageEditor ref={c => this.packageEditor = c} data={data} />
                </Modal>
            </div>
        );
    }
}