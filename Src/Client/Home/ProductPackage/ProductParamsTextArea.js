import React, { Component } from 'react';
import { Input } from 'antd';
const { TextArea } = Input;
import { FormatUnit } from '../../../Unit';
import './ProductParamsTextArea.css';

import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';

@inject('stores')
@observer
export default class ProductParamsTextArea extends Component {

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
        const { params } = categorys.currentObj;
        const dp = FormatUnit.isNullOrEmpty(params) ? "" : JSON.stringify(params);
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