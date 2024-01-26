import React, {useEffect, useRef, useState} from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme } from 'antd';
import {Link, Outlet, useLocation} from "react-router-dom";
const { Header, Sider, Content } = Layout;
import './index.scss';
import {debounce} from "lodash";

const MenuItems = [
    {
        key: 'article',
        icon: <UserOutlined />,
        label: <Link to="/backstage/article">文章管理</Link>,
    },
    {
        key: 'interface',
        icon: <VideoCameraOutlined />,
        label: <Link to="/backstage/interface">界面管理</Link>,
    },
    {
        key: 'upload',
        icon: <VideoCameraOutlined />,
        label: <Link to="/backstage/upload">文件上传</Link>,
    }
]

const AppLayout: React.FC = () => {
    const location = useLocation();
    // const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false);
    const [selectKey, setSelectKey] = useState('article')
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    useEffect(() => {
        console.log('update', location)
        console.log(location.pathname)
        setSelectKey(location.pathname.split('/backstage/')[1])
    }, [location])

    return (
        <Layout style={{width: '100vw', height: '100vh'}}>
            <Sider trigger={null} collapsible collapsed={collapsed} >
                <div className="menu-title">{collapsed ? 'IKC' : 'IKC BACKSTAGE'}</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectKey]}
                    items={MenuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        overflowY: 'scroll',
                        boxSizing:  'border-box'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
