import { observable, action } from 'mobx';
import axios from 'axios';
import { StatusCode } from '../../Config';
import { message } from 'antd';
import BaseDatasStore from './BaseDatasStore';

class LocalProductsStore extends BaseDatasStore {

    constructor(root, isLocal) {
        super(root);

        if (isLocal) {
            this.url = '/api/v1/getLocalProducts';
        }
        else {
            this.url = '/api/v1/getProducts';
        }
    }

    @action
    async getData() {
        const { currentId } = this.root.categorys;

        if (currentId === null) {
            return;
        }

        this.loading = true;

        try {
            const response = await axios.get(this.url, {
                headers: {
                    authorization_v1: 'null'
                },
                params: {
                    id: currentId
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
    async deleteProduct(id) {
        try {
            const response = await axios.post('/api/v1/deleteLocalProductsById',
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

export default LocalProductsStore;