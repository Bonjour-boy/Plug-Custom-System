import React, { Component } from 'react';
import { Form, Input, InputNumber, Checkbox, Switch, Col } from 'antd';

import './ProductParamsEditor.css';
import { FormatUnit } from '../../../Unit';

import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';

const TYPE = {
    NONE: -1,
    NUMBER: 0,
    BOOL: 1,
    STRING: 2,
    ARRAY: 3
}

@inject('stores')
@observer
export default class ProductParamsEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {

        }
    }

    onFinish(values) {
        const json = {};

        for (const key in values) {
            const v = values[key];
            const keyList = key.split('-');
            const id = keyList[0].toString();
            const k = keyList[1];
            if (json[id] === undefined || json[id] === null) {
                json[id] = {};
            }
            json[id][k] = v;
        }

        const list = [];

        for (const key in json) {
            const dict = {
                id: parseInt(key),
                ...json[key]
            }
            list.push(dict);
        }

        const jsonData = JSON.stringify(list);
        const { onSubmit } = this.props;
        onSubmit && onSubmit(jsonData);
    }

    _getFormKey(id, key) {
        return id + '-' + key;
    }

    _getType(value) {
        const type = typeof value;
        if (type === 'number') {
            return TYPE.NUMBER;
        }
        else if (type === 'string') {
            return TYPE.STRING;
        }
        else if (type === 'boolean') {
            return TYPE.BOOL
        }
        else if (Array.isArray(value)) {
            return TYPE.ARRAY
        }

        return TYPE.NONE;
    }

    _getTypeItem(type, data) {
        switch (type) {
            case TYPE.BOOL: {
                return (
                    <Switch />
                )
            }
            case TYPE.NUMBER: {
                return (
                    <InputNumber />
                )
            }
            case TYPE.STRING: {
                return (
                    <Input />
                )
            }
            case TYPE.ARRAY: {
                const options = [];
                for (let i = 0; i < data.value.length; i++) {
                    const obj = data.value[i];
                    options.push({
                        label: obj.text,
                        value: obj.value
                    })
                }
                return (
                    <Checkbox.Group options={options}>
                        {
                            data.value.map((obj, i) => {
                                return (
                                    <Checkbox key={i} value={obj.value} style={{ lineHeight: '32px' }}>
                                        {obj.text}
                                    </Checkbox>
                                )
                            })
                        }
                    </Checkbox.Group>
                )
            }
            default: {
                return <div>未定义的数据类型</div>
            }
        }
    }

    /**
     * 品类参数格式转换成可视化的参数格式
     * @param {*} json 
     */
    _toInitParams(json) {
        let dict = {};
        for (let i = 0; i < json.length; i++) {
            const params = json[i].params;
            for (const key in params) {
                const { value } = params[key];
                const formKey = this._getFormKey(json[i].id, key);
                dict[formKey] = value;
                //如果是数组类型，默认为空
                if (Array.isArray(value)) {
                    dict[formKey] = [];
                }
            }
        }

        console.log(dict)

        return dict;
    }

    /**
     * 产品参数格式转换成可视化的参数格式
     * @param {*} json 
     */
    _toTextParams(json) {
        let dict = {};
        for (let i = 0; i < json.length; i++) {
            const element = json[i];
            console.log(element)
            const id = element.id;
            for (const key in element) {
                if (key !== "id") {
                    const k = id + "-" + key;
                    dict[k] = {};
                    dict[k] = element[key];
                }
            }
        }

        console.log(dict)

        return dict;
    }

    submit() {
        this.form.submit();
    }

    renderItem(item) {
        const { id, name, params } = item;
        const list = [];
        for (const key in params) {
            const { text, value } = params[key];
            const type = this._getType(value);
            const typeItem = this._getTypeItem(type, params[key]);
            const formItem = (
                <Form.Item
                    key={this._getFormKey(id, key)}
                    label={text}
                    name={this._getFormKey(id, key)}
                    valuePropName={type === TYPE.BOOL ? "checked" : "value"}
                >
                    {typeItem}
                </Form.Item>
            )
            list.push(formItem);
        }
        return (
            <div key={id}>
                <p className="section-title">{"—————————————— " + name + " ——————————————"}</p>
                <div>
                    {list}
                </div>
            </div>
        )
    }

    render() {
        const {
            categorys
        } = this.props.stores;

        const categoryParams = toJS(categorys.currentObj.params);
        if (!FormatUnit.isNullOrEmpty(categoryParams)) {
            let initParams = null;
            if (FormatUnit.isNullOrEmpty(this.props.data.params)) {
                initParams = this._toInitParams(categoryParams)
            }
            else {
                initParams = this._toTextParams(JSON.parse(this.props.data.params));
            }
            return (
                <Form
                    name="basic"
                    ref={c => this.form = c}
                    onFinish={this.onFinish.bind(this)}
                    initialValues={initParams}
                    {...formItemLayout}
                >
                    {
                        categoryParams.map((item, index) => {
                            return this.renderItem(item);
                        })
                    }
                </Form>
            );
        }
        else {
            return (
                <div>
                    <p>项目没有参数配置，请先配置</p>
                </div>
            );
        }
    }
}

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
    },
};

const TESTJSON = [
    {
        "id": 0,
        "name": "制冷",
        "params": {
            "minValue": {
                "text": "最小值",
                "value": 16
            },
            "maxValue": {
                "text": "最大值",
                "value": 32
            },
            "isSupproted": {
                "text": "是否支持摆动",
                "value": true
            }
        }
    },
    {
        "id": 1,
        "name": "制热",
        "params": {
            "minValue": {
                "text": "最小值",
                "value": 17
            },
            "maxValue": {
                "text": "最大值",
                "value": 42
            },
            "isSupproted": {
                "text": "是否支持摆动",
                "value": false
            }
        }
    },
    {
        "id": 2,
        "name": "送风",
        "params": {
            "minValue": {
                "text": "最小值",
                "value": 15
            },
            "maxValue": {
                "text": "最大值",
                "value": 33
            },
            "isSupproted": {
                "text": "是否支持摆动",
                "value": false
            }
        }
    }
]