import React, {useEffect, useState} from 'react';
import { UploadOutlined } from '@ant-design/icons';
import {Button, message, Progress, Space, Upload} from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import service ,{ postApi } from "@/utils/request.ts";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

import AboutReqInstance from '../../utils/abort.ts';

// 大文件上传，文件切片大小
// 1024*1024为1M
const CHUNK_SIZE = 1024 * 1024 * 100;

interface ChunkItem {
    chunk: Blob,
    hash: string,
    fileHash: string,
    index: string,
}

const UploadPage = () => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    let originFileSize = 0
    /**
     * 文件切片：将原始的文件originFile根据设定的切片大小CHUNK_SIZE，切分成一个个小的切片数组
     * 方便后续将切片数组，转为promise请求数组
     * */
    const slicefileChunk = () => {
        if(!fileList.length)
            return

        // 组件限制了上传数量，fileList.length=1
        const originFile: any = fileList[0]
        console.log('origin file size', originFile)
        originFileSize = originFile.size
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
            index,
        }))
        return chunkList
    }

    const [imagePercentage, setImagePercentage] = useState(0)
    /* 文件切片 转 promise实例 */
    const turnChunkIntoPromise = (chunkList: Array<ChunkItem>) => {
        const chunkPromiseList: Array<Promise<any>> = []
        chunkList.forEach(({chunk,index, fileHash}) => {
            const formData = new FormData()
            formData.append('chunk', chunk)
            // formData.append('hash', hash)
            formData.append('index', index)
            formData.append('fileHash', fileHash)
            formData.append('filename', fileList[0].name)

            const p = AboutReqInstance.setAbortController(formData, () => {
                setImagePercentage(imagePercentage + 1)
                AboutReqInstance.setCount()
            })
            chunkPromiseList.push(p)
        })

        return chunkPromiseList
    }

    /*
    * （Web Worker）生成文件hash
    * @param {chunkList} 文件切片数组
    * */
    const [hashPercentage, setHashPercentage] = useState(0)
    const createHash = (chunkList: Array<ChunkItem>) => {
        return new Promise((resolve) => {
            const worker = new Worker('/hash.js')
            worker.postMessage({chunkList})
            worker.onmessage = e => {
                const {percentage, hash} = e.data
                console.log('percentage', Math.round(percentage))
                setHashPercentage(Math.round(percentage))
                if(hash)
                    resolve(hash)
            }
        })
    }

    const [progress, setProgress] = useState(0)
    useEffect(() => {
        if(hashPercentage + imagePercentage <= 100){
            setProgress(Math.round(0.3*hashPercentage))
        }else{
            setProgress(progress + 70/AboutReqInstance.getCount())
        }

    }, [hashPercentage, imagePercentage])

    const [suffix, setSuffix] = useState('')
    const [fileHash, setFileHash] = useState('')
    const handleUpload = async () => {
        let chunkList: Array<ChunkItem> = slicefileChunk()

        const fileHash = await createHash(chunkList)
        setFileHash(fileHash as string)
        console.log('fileHash', fileHash)

        chunkList = chunkList.map((item: ChunkItem) => ({
            ...item,
            fileHash
        }))
        console.log('chunkList',chunkList)

        // 文件后缀
        const suffix = fileList[0].name.split('.')[1]
        setSuffix(suffix)

        try{
            setUploading(true)

            // 查询文件是否已经存在
            const verify = await service.get(`/verify?filename=${fileHash}.${suffix}`)
            console.log('isExist', verify)
            if(verify.data){
                message.success("上传成功")
                return
            }

            const chunkPromiseList = turnChunkIntoPromise(chunkList)
            console.log('promise list', chunkPromiseList)

            await Promise.all(chunkPromiseList)
            const formData = new FormData()
            formData.append('suffix', suffix)
            formData.append("fileHash", fileHash+'')
            formData.append("size", CHUNK_SIZE+'')
            await service.post('/merge', formData)
            message.success('上传成功')
        }catch (e) {
            message.error('上传失败')
        }finally{
            setUploading(false)
        }
    };

    const pauseUpload = () => {
        AboutReqInstance.pause()
    }

    const continueUpload = async () => {
        try{
            AboutReqInstance.continue()
            const remainPromiselist = Array.from(AboutReqInstance.getList().values())
                .map(item => item.promise)

            console.log('promise map list', remainPromiselist)
            await Promise.all(remainPromiselist)
            const formData = new FormData()
            formData.append('suffix', suffix)
            formData.append("fileHash", fileHash+'')
            formData.append("size", CHUNK_SIZE+'')
            await service.post('/merge', formData)
            message.success('恢复上传成功')
        }catch (e) {
            console.error('upload error', e)
            message.error('上传失败')
        }
    }

    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
            setProgress(0)
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
        maxCount: 1
    };

    const conicColors = { '0%': '#87d068', '50%': '#ffe58f', '100%': '#ffccc7' };


    return (
        <div style={{display: 'flex'}}>
            <div style={{flex: 1}}>
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
                <br/>

            </div>

            <Space>
                <Button onClick={pauseUpload}>暂停</Button>
                <Button onClick={continueUpload}>恢复</Button>
            </Space>

            <div style={{flex: 1}}>
                <Progress type="dashboard" percent={progress} strokeColor={conicColors} />
            </div>
        </div>
    );
};

export default UploadPage;
