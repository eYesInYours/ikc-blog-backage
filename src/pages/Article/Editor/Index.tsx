import '@wangeditor/editor/dist/css/style.css' // 引入 css

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import {Button, Input, message, Space} from "antd";
import {debounce} from 'lodash';
import './Index.scss'

const MyEditor: React.FC  = () => {
    // editor 实例
    const [editor, setEditor] = useState<IDomEditor | null>(null)
    // 编辑器内容
    const [html, setHtml] = useState('')
    const navigate = useNavigate();

    // 模拟 ajax 请求，异步设置 html
    useEffect(() => {
        // setTimeout(() => {
        //     setHtml('<p>hello world</p>')
        // }, 1500)
    }, [])

    // 工具栏配置
    const toolbarConfig: Partial<IToolbarConfig> = {
        excludeKeys:['fullScreen'],
    }

    // 编辑器配置
    const editorConfig: Partial<IEditorConfig> = {
        placeholder: '请输入内容...',
        readOnly: false,
    }

    // 及时销毁 editor ，重要！
    useEffect(() => {
        return () => {
            if (editor == null) return
            editor.destroy()
            setEditor(null)
        }
    }, [editor])

    const onCreated = (editor: IDomEditor) => {
        setEditor(editor)
        console.log(editor.getAllMenuKeys())
        console.log(editor.getMenuConfig("fullScreen"))
    }

    // 编辑器内容变化
    const onEditorChange = debounce((editor) => {
        setHtml(editor.getHtml())
    }, 1500)


    const [publishing, setPublishing] = useState(false);
    // 发布文章
    const publish = () => {
        setPublishing(true)
        setTimeout(() => {
            setPublishing(false)
            message.success('发布成功')
        }, 2000)
    }

    return (
        <>
            <div className='editor-box'>
                <Toolbar
                    editor={editor}
                    defaultConfig={toolbarConfig}
                    mode="default"
                    className='tool-bal'
                />
                <Input className='title' placeholder="请输入你的文章标题" bordered={false} />
                <Editor
                    defaultConfig={editorConfig}
                    value={html}
                    onCreated={onCreated}
                    onChange={onEditorChange}
                    mode="default"
                    className='editor'
                />
                <Space className='bottom-btns'>
                    <Button onClick={() => navigate(-1)}>返回</Button>
                    <Button type='primary' onClick={publish} loading={publishing}>发布</Button>
                </Space>
            </div>
        </>
    )
}

export default MyEditor