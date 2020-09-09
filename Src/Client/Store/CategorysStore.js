import { observable, action } from 'mobx';
import axios from 'axios';
import { StatusCode } from '../../Config';
import BaseDatasStore from './BaseDatasStore';

class CategorysStore extends BaseDatasStore {
    @action
    async getData() {
        try {
            const response = await axios.get('/api/v1/getCategorys', {
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
}

export default CategorysStore;