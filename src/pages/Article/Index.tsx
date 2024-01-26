import React from "react";
import {Avatar, Button, Dropdown, Empty, List, MenuProps, Popover, Space, Tabs} from "antd";
import { EditOutlined, BookOutlined, LikeOutlined, MessageOutlined, StarOutlined, FieldTimeOutlined, MoreOutlined } from '@ant-design/icons';
// import {Link} from "react-router-dom";
// import empty from "@/assets/images/empty_article.jpg";
import { Link } from "react-router-dom";

import './index.scss';

// 草稿箱
const Draft = () => {
    return (
        <div style={{marginTop: 100}}>
            <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{ height: 60 }}
                description={
                    <span>这个人很懒，什么都没有留下~</span>
                }
            >
                {/*<Button type="primary" onClick={() => navigate}>开始创作</Button>*/}
                <Link to='/editor'>开始创作</Link>
            </Empty>
        </div>
    )
}

// 已发布
const Published = () => {
    const data = Array.from({ length: 23 }).map((_, i) => ({
        href: 'https://ant.design',
        title: `ant design part ${i}`,
        avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
        description:
            'Ant Design, a design language for background applications, is refined by Ant UED Team.',
        content:
            'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
    }));

    const IconText = ({ icon, text, hint }: { icon: React.FC; text: string, hint: string}) => (
        <Popover content={hint} title="" placement='bottom'>
            <Space style={{userSelect: 'none'}}>
                {React.createElement(icon)}
                {text}
            </Space>
        </Popover>

    );

    const PublishList = () => {
        const dropItems: MenuProps['items'] = [
            {
                key: '1',
                label: (
                    <Button type="link" size='small'>
                        编辑
                    </Button>
                ),
            },
            {
                key: '2',
                label: (
                    <Button type="link" size='small' danger>
                        删除
                    </Button>
                ),
            },
        ];

        return (
            <List
                itemLayout="vertical"
                size="large"
                pagination={{
                    onChange: (page) => {
                        console.log(page);
                    },
                    pageSize: 3,
                }}
                dataSource={data}
                renderItem={(item) => (
                    <List.Item
                        key={item.title}
                        actions={[
                            <IconText icon={StarOutlined} text="156" hint='收藏' key="list-vertical-star-o" />,
                            <IconText icon={LikeOutlined} text="156" hint='点赞' key="list-vertical-like-o" />,
                            <IconText icon={MessageOutlined} text="2" hint='评论' key="list-vertical-message" />,
                            <IconText icon={FieldTimeOutlined} text="2024/1/10" hint='发布时间' key="list-vertical-message" />,
                            <Dropdown menu={{ items: dropItems }} placement="bottomLeft" arrow trigger={['click']}>
                                <MoreOutlined/>
                            </Dropdown>
                        ]}
                        extra={
                            <img
                                width={272}
                                alt="logo"
                                src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                            />
                        }
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={item.avatar} />}
                            title={<a href={item.href}>{item.title}</a>}
                            description={item.description}
                        />
                        {item.content}
                    </List.Item>
                )}
            />
        )
    }


    return (
        <PublishList />
        // <div style={{marginTop: 140}}>
        //     <Empty  description={
        //         <div className='none-us'>还没有文章，<Link to='/editor'>快去写一篇吧!</Link></div>
        //     } image={empty} imageStyle={{ borderRadius: 16}} />
        // </div>
    )
}

const TabsItems = [
    {
        key: '1',
        label: '已发布',
        children: <Published/>,
        icon: <BookOutlined />,
    },
    {
        key: '2',
        label: '草稿箱',
        children: <Draft/>,
        icon: <EditOutlined />,
    }
]

const ArticleManage: React.FC = () => {
    return (
        <Tabs className='article-container'
            defaultActiveKey="1"
            items={TabsItems}
        />

    )
}

export default ArticleManage;