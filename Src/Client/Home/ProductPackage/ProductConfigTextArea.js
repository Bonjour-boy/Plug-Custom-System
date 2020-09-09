import React, { Component } from 'react';
import { Input } from 'antd';
const { TextArea } = Input;
import { FormatUnit } from '../../../Unit';
import './ProductConfigTextArea.css';

import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';

@inject('stores')
@observer
export default class ProductConfigTextArea extends Component {

    constructor(props) {
        super(props);

        this.state = {

        }

        this.value = null;
    }

    getValue(){
        return this.value;
    }

    render() {
        const { categorys } = this.props.stores;
        const { config } = categorys.currentObj;
        const dp = FormatUnit.isNullOrEmpty(config) ? "" : JSON.stringify(config);
        return (
            <TextArea
                rows={20}
                defaultValue={dp}
                onChange={(e)=>{
                    this.value = e.target.value;
                }}
            />
        )
    }
}