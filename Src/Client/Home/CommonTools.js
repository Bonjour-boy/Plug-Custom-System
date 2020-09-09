/**
 * 客户端UI参考https://ant.design/components/upload-cn/ ant-design upload 组件
 * action 改为 baseUrl+'/api/upload',目前上传的文件存储位置为 ./src/server/public/upload
 * 下载直接将链接赋值给downloadUrl便可
 */

import React, { Component } from 'react';
import { Tabs, Button, message, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
let downloadUrl = '';

export default class CommonTools extends Component {
    constructor(props) {
        super(props);

        this.basicProps = {
            name: 'file',
            action: 'http://localhost:8080/api/upload',
            multiple: true,
            onChange(info) {
                let self = this;
                if (info.file.status !== 'uploading') {
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                    downloadUrl = info.file.response.result.url;
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };

    }

    onClick = () => {
        let xhr = new XMLHttpRequest();
        var url = downloadUrl;
        var index = url.lastIndexOf("\/");
        var fileName = url.substring(index + 1, url.length);
        console.log(fileName);
        xhr.open('GET', downloadUrl);
        xhr.onload = function () {
            let blob = this.response; //使用response作为返回，而非responseText
            let reader = new FileReader();
            reader.readAsDataURL(blob); // 转换为base64，可以直接放入a标签href
            reader.onload = function (e) {
                // 转换完成，创建一个a标签用于下载
                let a = document.createElement("a");
                console.log(e)
                a.download = fileName;
                a.href = e.target.result;
                a.click();
            };
        }
        xhr.responseType = "blob";
        xhr.send();
    }

    render() {
        return (
            <div>
                <Tabs >
                    <TabPane tab="上传与下载" key="1">

                        <Upload {...this.basicProps}>
                            <Button>
                                <UploadOutlined /> 点击上传
                            </Button>

                        </Upload> <Button style={{ marginTop: 100 }} onClick={this.onClick}>点击下载</Button>

                    </TabPane>
                    <TabPane tab="工具2" key="2">

                    </TabPane>
                    <TabPane tab="工具3" key="3">

                    </TabPane>
                </Tabs>
            </div>
        )
    }
}