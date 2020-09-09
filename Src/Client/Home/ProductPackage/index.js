import React, { Component } from 'react';
import './index.css';
import '../../Global.css';

import axios from 'axios';
import { Platform, StatusCode } from '../../../Config';
import {
    Select,
    Table,
    Tag,
    Button,
    Modal,
    message,
    Upload,
    Radio,
    Tabs
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ProductParamsEditor from './ProductParamsEditor';
import ProductParamsTextArea from './ProductParamsTextArea';
import ProductConfigTextArea from './ProductConfigTextArea';
import { FormatUnit } from '../../../Unit';
import FaultManager from '../FaultManager/index';
const { Option } = Select;
const { TabPane } = Tabs;

import { observer, inject } from 'mobx-react';

@inject('stores')
@observer
export default class ProductPackage extends Component {
    constructor(props) {
        super(props);

        this.columns = [
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '型号',
                dataIndex: 'model',
                key: 'model'
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => {
                    return this.renderActionItem(record);
                }
            }
        ];

        //选中的项目
        this.selectedProject = null;
        this.state = {
            defaultLegalsList: [],
            showPreLegals: false,
            paramsTextAreaVisible: false,
            paramsTextAreaLoading: false,
            paramsEditorVisible: false,
            paramsEditorLoading: false,
            data: null
        };
    }

    onZipModal() {
        const infoModal = Modal.info({
            title: '下载压缩包',
            content: (
                <div>
                    <p>
                        <Button
                            className={'margin-top'}
                            type="primary"
                            onClick={() => {
                                this.onDownZip(Platform.miot);
                                infoModal.destroy();
                            }}
                        >
                            米家 - mpkg
                        </Button>
                    </p>
                    <p>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.onDownZip(Platform.viot);
                                infoModal.destroy();
                            }}
                        >
                            云米 - zip
                        </Button>
                    </p>
                </div>
            ),
            okText: '取消'
        });
    }

    onDownZip(platform) {
        const { categorys, pluginProjects } = this.props.stores;
        axios
            .get(
                '/api/v1/getPluginProjectZip',
                {
                    params: {
                        categoryId: categorys.currentId,
                        platform: platform
                    }
                },
                {
                    headers: {
                        authorization_v1: 'null'
                    }
                }
            )
            .then(response => {
                const { code, result } = response.data;
                console.log(result);
                if (code === StatusCode.success.code) {
                    const { path } = result;
                    if (path !== null) {
                        let xhr = new XMLHttpRequest();
                        var url = path;
                        var index = url.lastIndexOf('/');
                        var fileName = url.substring(index + 1, url.length);
                        console.log(fileName);
                        xhr.open('GET', path);
                        xhr.onload = function () {
                            let blob = this.response; //使用response作为返回，而非responseText
                            let reader = new FileReader();
                            reader.readAsDataURL(blob); // 转换为base64，可以直接放入a标签href
                            reader.onload = function (e) {
                                // 转换完成，创建一个a标签用于下载
                                let a = document.createElement('a');
                                console.log(e);
                                a.download = fileName;
                                a.href = e.target.result;
                                a.click();
                            };
                        };
                        xhr.responseType = 'blob';
                        xhr.send();
                    } else {
                        message.error('文件不存在');
                    }
                } else {
                    message.error('操作失败');
                }

                pluginProjects.getData();
            })
            .catch(e => {
                console.log(e);

                message.error('操作失败');

                pluginProjects.getData();
            });
    }

    onBuildModal() {
        const infoModal = Modal.info({
            title: '构建方式',
            content: (
                <div>
                    <p className={'margin-top'}>
                        <p>* 生成米家mpkg，手动上传到米家IOT</p>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.onBundle(Platform.miot);
                                infoModal.destroy();
                            }}
                        >
                            米家mpkg
                        </Button>
                    </p>
                    <p className={'margin-top'}>
                        <p>* 生成云米zip，自动上传到云米IOT</p>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.onBundle(Platform.viot);
                                infoModal.destroy();
                            }}
                        >
                            云米上传
                        </Button>
                    </p>
                </div>
            ),
            okText: '取消'
        });
    }

    onBundle(platform) {
        const { pluginProjects, categorys } = this.props.stores;

        axios
            .post(
                '/api/v1/packagePluginProject',
                {
                    id: categorys.currentId,
                    platform: platform
                },
                {
                    headers: {
                        authorization_v1: 'null'
                    }
                }
            )
            .then(response => {
                const { code } = response.data;
                if (code === StatusCode.success.code) {
                    message.success('操作成功');
                } else {
                    message.error('操作失败');
                }

                pluginProjects.getData();
            })
            .catch(e => {
                message.error('操作失败');

                pluginProjects.getData();
            });
    }

    deleteProduct() {
        const { localProducts } = this.props.stores;
        localProducts.deleteProduct(this.selectedProject.id);
    }

    getLegalsData() {
        const { categorys } = this.props.stores;
        console.log('categorys.currentId:', categorys.currentId);
        axios
            .post(
                '/api/v1/getPluginProjectLegalsInfo',
                {
                    categoryId: categorys.currentId
                },
                {
                    headers: {
                        authorization_v1: 'null'
                    }
                }
            )
            .then(response => {
                const { code, result } = response.data;

                console.log('result:', response);
                if (code === StatusCode.success.code) {
                    if (result.hasPlugin) {
                        this.setState({
                            showPreLegals: true,
                            defaultLegalsList: result.defaultList
                        });
                    } else {
                        message.error('请先构建项目');
                    }
                } else {
                    message.error('操作失败');
                }
            })
            .catch(e => {
                message.error('操作失败');
            });
    }

    onShowParamsEditor(data) {
        this.setState({
            paramsEditorVisible: true,
            data: data
        });
    }

    onHideParamsEditor() {
        this.setState({
            paramsEditorVisible: false
        });
    }

    /**
     * 显示品类配置的输入框
     */
    onShowCategoryConfigTextArea() {
        this.setState({
            configTextAreaVisible: true
        });
    }

    /**
     * 隐藏品类配置的输入框
     */
    onHideCategoryConfigTextArea() {
        this.setState({
            configTextAreaVisible: false
        });
    }

    /**
     * 保存品类配置
     */
    saveCategoryConfig() {
        const json = this.configTextArea.getValue();

        if (FormatUnit.isJsonString(json)) {
            const { categorys } = this.props.stores;
            const { id } = categorys.currentObj;
            axios
                .post('/api/v1/updateCategoryConfig', {
                    id: id,
                    config: json
                })
                .then(res => {
                    const data = res.data;
                    const { code } = data;
                    if (code === StatusCode.success.code) {
                        message.success('操作成功!');
                    }
                    this.setState({
                        configTextAreaLoading: false,
                        configTextAreaVisible: false
                    });
                    categorys.getData();
                    console.log(res);
                })
                .catch(e => {
                    this.setState({
                        configTextAreaLoading: false,
                        configTextAreaVisible: false
                    });
                    categorys.getData();
                    console.log(e);
                });
        }
        else {
            message.error("只支持json格式");
        }
    }

    /**
     * 显示品类参数的输入框
     */
    onShowCategoryParamsTextArea() {
        this.setState({
            paramsTextAreaVisible: true
        });
    }

    /**
     * 隐藏品类参数的输入框
     */
    onHideCategoryParamsTextArea() {
        this.setState({
            paramsTextAreaVisible: false
        });
    }

    /**
     * 保存品类参数
     */
    saveCategoryParams() {
        const json = this.paramsTextArea.getValue();

        if (FormatUnit.isJsonString(json)) {
            const { categorys } = this.props.stores;
            const { id } = categorys.currentObj;
            axios
                .post('/api/v1/updateCategoryParams', {
                    id: id,
                    params: json
                })
                .then(res => {
                    const data = res.data;
                    const { code } = data;
                    if (code === StatusCode.success.code) {
                        message.success('操作成功!');
                    }
                    this.setState({
                        paramsTextAreaLoading: false,
                        paramsTextAreaVisible: false
                    });
                    categorys.getData();
                    console.log(res);
                })
                .catch(e => {
                    this.setState({
                        paramsTextAreaLoading: false,
                        paramsTextAreaVisible: false
                    });
                    categorys.getData();
                    console.log(e);
                });
        }
        else {
            message.error("只支持json格式");
        }
    }

    onSubmitParams(json) {
        this.setState(
            {
                paramsEditorLoading: true
            },
            () => {
                const { localProducts } = this.props.stores;

                axios
                    .post('/api/v1/updateProductParams', {
                        id: this.selectedProject.id,
                        params: json
                    })
                    .then(res => {
                        const data = res.data;
                        const { code } = data;
                        if (code === StatusCode.success.code) {
                            message.success('操作成功!');
                        }
                        this.setState({
                            paramsEditorLoading: false,
                            paramsEditorVisible: false
                        });
                        localProducts.getData();
                        console.log(res);
                    })
                    .catch(e => {
                        this.setState({
                            paramsEditorLoading: false,
                            paramsEditorVisible: false
                        });
                        localProducts.getData();
                        console.log(e);
                    });
            }
        );
    }

    renderActionItem(record) {
        const { currentPackagingProject } = this.props.stores.pluginProjects;

        if (currentPackagingProject !== null) {
            return (
                <Button disabled={true} type="primary">
                    {'等待构建完成'}
                </Button>
            );
        }

        return (
            <div>
                <Button
                    className={'margin-left'}
                    disabled={false}
                    type="primary"
                    onClick={() => {
                        this.selectedProject = record;
                        this.onShowParamsEditor(record);
                    }}
                >
                    {'参数'}
                </Button>
                <Button
                    className={'margin-left'}
                    disabled={false}
                    type="primary"
                    onClick={() => {
                        Modal.confirm({
                            title: '删除产品信息',
                            content: (
                                <div>
                                    <p>
                                        是否确认删除该产品的配置信息和相关参数
                                    </p>
                                </div>
                            ),
                            onOk: () => {
                                this.selectedProject = record;
                                this.deleteProduct();
                            },
                            okText: '确定',
                            cancelText: '取消'
                        });
                    }}
                >
                    {'删除'}
                </Button>
            </div>
        );
    }

    renderLegalsItem(list) {
        return (
            <Tabs defaultActiveKey={'1'} onChange={() => { }}>
                {list.map((item, index) => {
                    return (
                        <TabPane
                            tab={item.itemName}
                            key={(index + 1).toString()}
                        >
                            {/* {item.data} */}

                            <iframe
                                width={1000}
                                height={500}
                                srcDoc={item.data}
                            />
                        </TabPane>
                    );
                })}
            </Tabs>
        );
    }

    _bindFaultRef = ref => {
        if (ref) this.faultRef = ref;
    };

    render() {
        const {
            defaultLegalsList,
            paramsEditorVisible,
            paramsEditorLoading,
            data
        } = this.state;
        const { categorys, localProducts, pluginProjects } = this.props.stores;
        const actionButtonsVisable =
            pluginProjects.currentPackagingProject === null &&
            localProducts.datas.length > 0;

        const createButtonsVisable = (pluginProjects.currentPackagingProject === null &&
            localProducts.datas.length === 0 && categorys.currentObj !== null);

        let basicProps = {};

        if (actionButtonsVisable) {
            let self = this;
            basicProps = {
                showUploadList: false,
                name: 'file',
                action:
                    "https://plugcenter.viomi.com.cn" +
                    // 'http://localhost:8080' + 
                    '/api/uploadLegalsZip?categoryId=' +
                    categorys.currentId,
                multiple: true,
                onChange(info) {
                    if (info.file.status !== 'uploading') {
                    }
                    if (info.file.status === 'done') {
                        console.log(info);
                        if (
                            info.file.response.code === StatusCode.success.code
                        ) {
                            message.success(
                                `${info.file.name} file uploaded successfully`
                            );
                            self.getLegalsData();
                        } else {
                            message.error(
                                `${info.file.name} file uploaded successfully`
                            );
                            // alert('请上传正确的用户协议和隐私zip包');
                        }
                    } else if (info.file.status === 'error') {
                        message.error(`${info.file.name} file upload failed.`);
                    }
                }
            };
        }

        return (
            <div>
                {pluginProjects.currentPackagingProject ? (
                    <p>
                        {'当前构建项目：' +
                            pluginProjects.currentPackagingProject.name}
                    </p>
                ) : null}
                <Select
                    className={'margin-top'}
                    style={{ width: 200 }}
                    notFoundContent={'加载中...'}
                    defaultValue={categorys.currentId}
                    onSelect={value => {
                        categorys.setCurrentId(value);
                        localProducts.getData();
                    }}
                >
                    {categorys.datas.map((item, i) => {
                        return (
                            <Option key={i} value={item.id}>
                                {item.comment}
                            </Option>
                        );
                    })}
                </Select>
                {
                    createButtonsVisable ?
                        <div className={'margin-top'}>
                            <Button
                                type="primary"
                                onClick={() => {
                                    this.onShowCategoryConfigTextArea();
                                }}
                            >
                                {'品类配置'}
                            </Button>
                            <Button
                                className={'margin-left'}
                                type="primary"
                                onClick={() => {
                                    this.onShowCategoryParamsTextArea();
                                }}
                            >
                                {'品类参数'}
                            </Button>
                        </div>
                        :
                        null
                }
                {actionButtonsVisable ? (
                    <div className={'margin-top'}>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.onBuildModal();
                            }}
                        >
                            {'构建'}
                        </Button>
                        <Button
                            className={'margin-left'}
                            type="primary"
                            onClick={() => {
                                this.onZipModal();
                            }}
                        >
                            {'下载'}
                        </Button>
                        <Button
                            className={'margin-left'}
                            type="primary"
                            onClick={() => {
                                this.getLegalsData();
                            }}
                        >
                            {'协议'}
                        </Button>
                        <Button
                            className={'margin-left'}
                            type="primary"
                            onClick={() => {
                                this.onShowCategoryConfigTextArea();
                            }}
                        >
                            {'品类配置'}
                        </Button>
                        <Button
                            className={'margin-left'}
                            type="primary"
                            onClick={() => {
                                this.onShowCategoryParamsTextArea();
                            }}
                        >
                            {'品类参数'}
                        </Button>
                        <Button
                            className={'margin-left'}
                            type="primary"
                            onClick={() => {
                                console.log(categorys.currentId);
                                this.faultRef &&
                                    this.faultRef.show(categorys.currentId);
                            }}
                        >
                            {'故障'}
                        </Button>
                    </div>
                ) : null}

                <Table
                    className={'margin-top'}
                    dataSource={localProducts.datas}
                    bordered={true}
                    columns={this.columns}
                    loading={localProducts.loading}
                    rowKey="id"
                />
                <Modal
                    title="预览协议"
                    width={1200}
                    visible={this.state.showPreLegals}
                    onCancel={() => {
                        this.setState({ showPreLegals: false });
                    }}
                    closable={true}
                    footer={null}
                    maskClosable={false}
                >
                    <div>
                        <p>
                            <Upload {...basicProps}>
                                <Button
                                    className={'margin-left'}
                                    type="primary"
                                >
                                    <UploadOutlined /> {'上传协议'}
                                </Button>
                            </Upload>
                        </p>

                        {defaultLegalsList.length > 0 ? (
                            this.renderLegalsItem(defaultLegalsList)
                        ) : (
                                <p>暂无默认的Legals 请先构建系统</p>
                            )}
                    </div>
                </Modal>
                <Modal
                    title="品类配置"
                    width={1200}
                    visible={this.state.configTextAreaVisible}
                    onOk={() => {
                        this.saveCategoryConfig();
                    }}
                    onCancel={() => {
                        this.onHideCategoryConfigTextArea();
                    }}
                    closable={true}
                    maskClosable={false}
                    okText={'确定'}
                    cancelText={'取消'}
                >
                    <ProductConfigTextArea
                        ref={c => (this.configTextArea = c)}
                    />
                </Modal>
                <Modal
                    title="品类参数"
                    width={1200}
                    visible={this.state.paramsTextAreaVisible}
                    onOk={() => {
                        this.saveCategoryParams();
                    }}
                    onCancel={() => {
                        this.onHideCategoryParamsTextArea();
                    }}
                    closable={true}
                    maskClosable={false}
                    okText={'确定'}
                    cancelText={'取消'}
                >
                    <ProductParamsTextArea
                        ref={c => (this.paramsTextArea = c)}
                    />
                </Modal>
                <Modal
                    title="参数配置"
                    visible={paramsEditorVisible}
                    onOk={() => {
                        this.paramsEditor.submit();
                    }}
                    onCancel={() => {
                        this.onHideParamsEditor();
                    }}
                    confirmLoading={paramsEditorLoading}
                    okText={'确定'}
                    cancelText={'取消'}
                    destroyOnClose={true}
                    maskClosable={false}
                    width={600}
                >
                    <ProductParamsEditor
                        ref={c => (this.paramsEditor = c)}
                        data={data}
                        onSubmit={json => {
                            this.onSubmitParams(json);
                        }}
                    />
                </Modal>
                <FaultManager ref={this._bindFaultRef} />
            </div>
        );
    }
}
