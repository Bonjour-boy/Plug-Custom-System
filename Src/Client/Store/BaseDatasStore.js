import { observable, action, computed } from 'mobx';

class BaseDatasStore {
    root = null;

    @observable
    currentId = null;

    @computed
    get currentObj() {
        if (this.datas.length > 0 && this.currentId !== null) {
            for (let i = 0; i < this.datas.length; i++) {
                const element = this.datas[i];
                if (element.id === this.currentId) {
                    return element;
                }
            }
        }

        return null;
    };

    @observable
    datas = [];

    @observable
    loading = false;

    constructor(root) {
        this.root = root;
    }

    @action
    async getData() {
        console.info('尚未定义');
        return null;
    }

    @action
    setData(datas) {
        this.datas = datas;
        this.loading = false;
    }

    @action
    setCurrentId(id) {
        this.currentId = id;
    }
}

export default BaseDatasStore;
