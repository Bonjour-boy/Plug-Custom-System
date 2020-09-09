import { action, observable } from 'mobx';
import axios from 'axios';
import { StatusCode } from '../../Config';
import BaseDatasStore from './BaseDatasStore';
import { message } from 'antd';

function formatResultToDatas(result) {
    if (result && result.length === 2) {
        let faultType = 'bit_';
        let datas = Object.keys(result[0]);
        if (datas.length > 0) {
            if (/error/.test(datas[0])) faultType = 'error_';
            datas = datas.map((code, key) => ({
                key,
                code: code.replace(/(bit|error|_)/g, ''),
                zh_title: result[0][code].title,
                zh_detail: result[0][code].detail,
                en_title: result[1][code].title,
                en_detail: result[1][code].detail
            }));
        }
        return { datas, faultType };
    }
    return [];
}

function formatDatasToResponse(datas, type) {
    const zh = {};
    const en = {};
    datas.map(v => {
        const key = type + v.code.trim();
        zh[key] = {
            title: v.zh_title,
            detail: v.zh_detail
        };
        en[key] = {
            title: v.en_title,
            detail: v.en_detail
        };
    });
    return [zh, en];
}

class FaultCodeDetailsStore extends BaseDatasStore {
    @observable
    faultType = 'bit_';

    @action
    async getData(id) {
        this.loading = true;
        this.currentId = id;
        this.datas = [];
        try {
            const response = await axios.get(
                '/api/v1/readFaultProfile?categoryId=' + id
            );
            const { code, msg, result } = response.data;
            if (code === StatusCode.success.code) {
                const { datas, faultType } = formatResultToDatas(result);
                this.setData(datas);
                this.setFaultType(faultType);
            } else {
                this.setData([]);
                message.error(msg);
            }
        } catch (e) {
            this.setData([]);
        }
    }

    @action
    setData(datas) {
        super.setData(datas);
    }

    @action
    setFaultType(faultType) {
        this.faultType = faultType;
    }

    @action
    clearData() {
        this.loading = false;
        this.currentId = null;
        this.datas = [];
    }

    @action
    async update(datas) {
        try {
            const response = await axios.post('/api/v1/writeFaultProfile', {
                categoryId: this.currentId,
                faultData: JSON.stringify(
                    formatDatasToResponse(datas, this.faultType)
                )
            });

            const { code } = response.data;

            if (code === StatusCode.success.code) {
                message.success('提交成功!');
            } else {
                message.error('提交失败!');
            }
        } catch (e) {
            message.error('提交出错!');
        }
    }
}

export default FaultCodeDetailsStore;
