import { Button, Divider, Form, Input, Popconfirm, Table } from 'antd';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const rules =
        dataIndex == 'code' ||
        dataIndex == 'zh_title' ||
        dataIndex == 'en_title'
            ? [
                  {
                      required: true,
                      message: `请输入 ${title}!`
                  }
              ]
            : null;
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item name={dataIndex} style={{ margin: 0 }} rules={rules}>
                    <Input />
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

export default class RowEditableTable extends Component {
    static propTypes = {
        columns: PropTypes.array,
        dataSource: PropTypes.array,
        addButton: PropTypes.bool,
        submitBtn: PropTypes.bool,
        onChange: PropTypes.func,
        onSubmit: PropTypes.func
    };

    static defaultProps = {
        columns: [],
        dataSource: [],
        addButton: false,
        submitBtn: false,
        onChange: () => {},
        onSubmit: () => {}
    };

    static getDerivedStateFromProps(props, state) {
        const { dataSource, onChange } = props;
        if (dataSource !== state.dataSource) {
            onChange && onChange(dataSource);
            return {
                dataSource,
                datas: dataSource,
                editingKey: ''
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        const { columns, dataSource } = props;

        this.state = {
            dataSource,
            datas: dataSource,
            editingKey: ''
        };

        this.formRef = React.createRef();

        this.pagination = {
            onChange: this.cancel
        };

        this.components = {
            body: {
                cell: EditableCell
            }
        };

        this.columnsKey = {};
        columns.map(v => {
            this.columnsKey[v.dataIndex] = '';
        });

        this.mergedColumns = [
            ...columns,
            {
                title: '操作',
                dataIndex: 'operation',
                width: 100,
                render: (_, record) => {
                    const editable = this.isEditing(record);
                    return editable ? (
                        <>
                            <a
                                style={{
                                    marginRight: 8,
                                    color: '#333',
                                    cursor: 'pointer'
                                }}
                                onClick={() => this.save(record.key)}
                            >
                                保存
                            </a>
                            <a
                                style={{
                                    marginRight: 8,
                                    color: '#333',
                                    cursor: 'pointer'
                                }}
                                onClick={this.cancel}
                            >
                                取消
                            </a>
                        </>
                    ) : (
                        <>
                            <a
                                style={{ marginRight: 8, cursor: 'pointer' }}
                                disabled={this.state.editingKey !== ''}
                                onClick={() => this.edit(record)}
                            >
                                修改
                            </a>
                            <Popconfirm
                                title="确定删除?"
                                onConfirm={() => this.delete(record.key)}
                            >
                                <a>删除</a>
                            </Popconfirm>
                        </>
                    );
                }
            }
        ].map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === 'age' ? 'number' : 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record)
                })
            };
        });
    }

    isEditing = record => record.key === this.state.editingKey;

    edit = record => {
        this.formRef.current.setFieldsValue({
            ...this.columnsKey,
            ...record
        });
        this.setState({ editingKey: record.key });
    };

    save = async key => {
        try {
            const row = await this.formRef.current.validateFields();

            const newData = [...this.state.datas];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                this.onChange({ datas: newData, editingKey: '' });
            } else {
                newData.push(row);
                this.onChange({ datas: newData, editingKey: '' });
            }
        } catch (errInfo) {
            console.warn('Validate Failed:', errInfo);
        }
    };

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    delete = key => {
        this.onChange({
            datas: this.state.datas.filter(item => item.key !== key)
        });
    };

    add = () => {
        const { datas } = this.state;
        const last = datas.length - 1;
        const key = last >= 0 ? datas[last].key + 1 : 0;
        const newData = {
            ...this.columnsKey,
            key
        };
        this.onChange({
            datas: [...datas, newData]
        });
    };

    onChange = obj => {
        this.setState(obj);
        this.props.onChange(obj.datas);
    };

    submit = () => {
        this.props.onSubmit(this.state.datas);
    };

    render() {
        const { addButton, submitBtn } = this.props;
        const { datas } = this.state;

        return (
            <div>
                {addButton ? (
                    <>
                        <Button onClick={this.add} type="primary">
                            增加故障码
                        </Button>
                        <Divider />
                    </>
                ) : null}
                <Form ref={this.formRef} component={false}>
                    <Table
                        rowClassName="editable-row"
                        components={this.components}
                        pagination={this.pagination}
                        columns={this.mergedColumns}
                        dataSource={datas}
                        bordered
                    />
                </Form>
                {submitBtn ? (
                    <Button onClick={this.submit} type="primary">
                        提交保存
                    </Button>
                ) : null}
            </div>
        );
    }
}
