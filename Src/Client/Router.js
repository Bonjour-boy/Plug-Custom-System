import Home from './Home';
import Login from './Login';
import NotFound from './NotFound';
import DBTest from './Home/DBTest';
import PlugPackageInfo from './Home/PlugProject';
import VersionLogList from './Home/VersionLogList';
import CommonTools from './Home/CommonTools';
import CMDTest from './Home/CMDTest';
import ProductPackage from './Home/ProductPackage';
import PlugLogList from './Home/PlugLogList';

export const routers = [
    {
        index: 0,
        path: '/',
        component: Home
    },
    {
        index: 1,
        path: '/login',
        component: Login
    },
    {
        index: 2,
        path: '/404',
        component: NotFound
    }
];

export const secrouter = [
    {
        path: '/home/productList',
        component: ProductPackage,
        title: '构建'
    },
    {
        path: '/home/info',
        component: PlugPackageInfo,
        title: '插件项目'
    },
    {
        path: '/home/tool',
        component: CommonTools,
        title: '常用工具'
    },
    // {
    //     path: '/home/data',
    //     component: DBTest,
    //     title: '数据库测试'
    // },
    // {
    //     path: '/home/cmd',
    //     component: CMDTest,
    //     title: '命令行测试'
    // },
    {
        path: '/home/version',
        component: VersionLogList,
        title: '版本迭代'
    },
    {
        path: '/home/log',
        component: PlugLogList,
        title: '系统日志'
    }
];
