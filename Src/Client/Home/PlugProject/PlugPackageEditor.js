import React, { Component } from 'react';
import { Input, Button, Radio, Modal, message, Select, Menu } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

import './PlugPackageEditor.css';
import { StatusCode, Platform } from '../../../Config';
const { Option } = Select;

import { observer, inject } from 'mobx-react';

@inject('stores')
@observer
export default class PlugPackageEditor extends Component {

    constructor(props) {
        super(props);

        const { data } = this.props;

        this.state = {
            buildId: data ? data.id : null,
            buildName: data ? data.name : '',
            buildProjectName: data ? data.projectName : '',
            buildCategoryId: data ? data.categoryId : null,
            buildProjectPlatform: data ? data.platform : Platform.viot,
            buildGitAddress: data ? data.git : ''
        }
    }

    updateName() {
        const { buildCategoryId, buildProjectPlatform } = this.state;
        const platformName =
            buildProjectPlatform === Platform.viot ? '云米' : '米家';
        const categoryName = this.getCategoryNameById(buildCategoryId);
        this.setState({
            buildName: platformName + categoryName,
        });
    }

    getCategoryNameById(id) {
        if (id) {
            const { datas } = this.props.stores.categorys;

            for (let i = 0; i < datas.length; i++) {
                const element = datas[i];
                if (element.id === id) {
                    return element.comment;
                }
            }
        }

        return '';
    }

    returnData() {
        const {
            buildId,
            buildName,
            buildProjectName,
            buildGitAddress,
            buildProjectPlatform,
            buildCategoryId
        } = this.state;

        let data = {
            id: buildId ? buildId : null,
            name: buildName,
            projectName: buildProjectName,
            platform: buildProjectPlatform,
            categoryId: buildCategoryId,
            git: buildGitAddress,
        };

        return data;
    }

    render() {
        const {
            buildName,
            buildProjectName,
            buildGitAddress,
            buildProjectPlatform,
            buildCategoryId
        } = this.state;

        const { categorys } = this.props.stores;
        return (
            <div className={'itemTop'}>
                <p className={'itemTop'}>名称:</p>
                <Input disabled={true} value={buildName} />
                <p className={'itemTop'}>项目包名称:</p>
                <Input
                    value={buildProjectName}
                    disabled={true}
                />
                <p className={'itemTop'}>平台:</p>
                <Radio.Group
                    onChange={(e) => {
                        this.setState({
                            buildProjectPlatform: e.target.value,
                        },
                            () => {
                                this.updateName();
                            }
                        );
                    }}
                    value={buildProjectPlatform}
                >
                    <Radio value={Platform.viot}>云米</Radio>
                    <Radio value={Platform.miot}>米家</Radio>
                </Radio.Group>
                <p className={'itemTop'}>品类:</p>
                <Select
                    style={{ width: 200 }}
                    notFoundContent={'加载中...'}
                    defaultValue={buildCategoryId}
                    onSelect={(value) => {
                        this.setState({
                            buildCategoryId: value
                        },
                            () => {
                                this.updateName();
                            })
                    }}
                >
                    {
                        categorys.datas.map((item, i) => {
                            return (
                                <Option key={i} value={item.id}>
                                    {item.comment}
                                </Option>
                            );
                        })
                    }
                </Select>
                <p className={'itemTop'}>git地址:</p>
                <Input
                    value={buildGitAddress}
                    onChange={(e) => {
                        this.setState({
                            buildGitAddress: e.target.value,
                        });
                    }}
                    onBlur={(e) => {
                        let str = e.target.value
                        let RE = str.match(/com\.(viomi|xiaomi)\.(\S*)\.git/)
                        if (RE == null) {
                            return message.error('请输入正确的git地址')
                        }
                        let value = 'com.' + RE[1] + '.' + RE[2];
                        this.setState({
                            buildProjectName: value,
                        })
                    }}
                />
            </div>
        );
    }
}
