import { observable, action } from 'mobx';
import axios from 'axios';
import { StatusCode, PluginStatus } from '../../Config';
import { message } from 'antd';
import BaseDatasStore from './BaseDatasStore';

class PluginProjectsStore extends BaseDatasStore {
    @observable
    currentPackagingProject = null;

    @action
    async getData() {
        this.loading = true;

        try {
            const response = await axios.get('/api/v1/getPluginProjects', {
                headers: {
                    authorization_v1: 'null'
                }
            })

            const { code, result } = response.data;

            if (code === StatusCode.success.code) {
                this.setData(result);
            }
            else {
                this.setData([]);
            }
        }
        catch (e) {
            this.setData([]);
        }
    }

    @action
    setData(datas) {
        super.setData(datas);

        if (datas.length > 0) {
            for (let i = 0; i < datas.length; i++) {
                const element = datas[i];
                if (element.status === PluginStatus.packaging) {
                    this.currentPackagingProject = element;
                }
            }
        }
    }

    @action
    async deleteData(id) {
        try {
            const response = await axios.post('/api/v1/deleteProductsById',
                {
                    id: id
                },
                {
                    headers: {
                        authorization_v1: 'null'
                    }
                })

            const { code } = response.data;

            if (code === StatusCode.success.code) {
                message.success('删除成功!');
            }
            else {
                message.error('删除失败!');
            }

            this.getData();
        }
        catch (e) {
            message.error('删除出错!');
        }
    }
}

export default PluginProjectsStore;