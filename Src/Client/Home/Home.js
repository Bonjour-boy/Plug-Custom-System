import React, { Component } from 'react';
import './index.css';
import '../Global.css';
import { Button } from 'antd';
import { secrouter } from '../Router';
import { withRouter } from 'react-router-dom';
import qs from 'query-string';
import { observer, inject } from 'mobx-react';

@inject('stores')
@observer
class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0,
        };
    }
    componentDidMount() {
        const value = qs.parse(this.props.location.search)
        const index = parseInt(value.index)
        this.setState({ index });
        this.props.history.listen(route => {
            if (!route.search) {
                this.setState({ index: 0 });
            }
        })

        this.props.stores.categorys.getData();
        this.props.stores.pluginProjects.getData();
    }

    onSlideButton(index) {
        this.props.history.push(secrouter[index].path + '?index=' + index)
        this.setState({ index });
    }


    render() {
        const { index } = this.state
        return (
            <div>
                <div className="flex-row">
                    <div className={'slideBar flex-column'}>
                        {secrouter.map((item, i) => {
                            return (
                                <Button
                                    className='button'
                                    key={i}
                                    type={
                                        index === i
                                            ? 'primary'
                                            : 'default'
                                    }
                                    onClick={() => {
                                        this.onSlideButton(i);
                                    }}
                                >
                                    {item.title}
                                </Button>
                            );
                        })}
                    </div>
                    <div className={'content'}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}
export default withRouter(Home)