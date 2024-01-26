import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { postApi } from "@/utils/request.ts";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

// 大文件上传，文件切片大小
const CHUNK_SIZE = 1024 * 1024;

interface ChunkItem {
    chunk: Blob,
    hash: string
}

const UploadPage = () => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);

    /* 文件切片 */
    const slicefileChunk = () => {
        if(!fileList.length)
                return

        // 组件限制了上传数量，fileList.length=1
        const originFile: any = fileList[0]
        console.log('origin file size', originFile.size)
        let chunkList = []
        let current = 0
        while(current < originFile.size){
            const chunk = originFile.slice(current, current + CHUNK_SIZE)
            chunkList.push(chunk)
            current += CHUNK_SIZE
        }

        // 添加每个切片的hash，表示唯一性
        chunkList = chunkList.map((chunk, index) => ({
            chunk,
            hash: originFile.name + '-' + index
        }))

        console.log('chunk list', chunkList)

        return chunkList
    }

    /* 文件切片 转 promise实例 */
    const turnChunkIntoPromise = (chunkList: Array<ChunkItem>) => {
        const chunkPromiseList: Array<Promise<any>> = []
        chunkList.forEach(({chunk, hash}) => {
            const formData = new FormData()
            formData.append('chunk', chunk)
            formData.append('hash', hash)
            formData.append('filename', fileList[0].name)

            const p = fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            })
            chunkPromiseList.push(p)

        })

        return chunkPromiseList
    }

    const handleUpload = async () => {
        const chunkList: Array<ChunkItem> = slicefileChunk()

        const chunkPromiseList = turnChunkIntoPromise(chunkList)

        console.log('promise list', chunkPromiseList)

        try{
            await Promise.all(chunkPromiseList)
            await fetch('http://localhost:8000/merge', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: fileList[0].name,
                    size: CHUNK_SIZE
                })
            })
            message.success('上传成功')
        }catch (e) {
            message.error('上传失败')
        }

        // const formData = new FormData();
        // fileList.forEach((file: any ) => {
        //     console.log(fileList, 'filelist')
        //     formData.append('files[]', file );
        // });
        // setUploading(true);

        // fetch('http://localhost:8000/upload', {
        //     method: 'POST',
        //     body: formData,
        // })
        //     .then((res) => res.json())
        //     .then(() => {
        //         setFileList([]);
        //         message.success('upload successfully.');
        //     })
        //     .catch((err: any) => {
        //         message.error('upload failed.', err);
        //     })
        //     .finally(() => {
        //         setUploading(false);
        //     });
    };

    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
        maxCount: 1
    };

    return (
        <>
            <Upload {...props}>
                <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <Button
                type="primary"
                onClick={handleUpload}
                disabled={fileList.length === 0}
                loading={uploading}
                style={{ marginTop: 16 }}
            >
                {uploading ? '上传中' : '开始上传'}
            </Button>
        </>
    );
};

export default UploadPage;
