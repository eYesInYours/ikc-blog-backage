// self 是 Web Worker 的一个全局对象，就像主线程中的 window对象

// 导入脚本
self.importScripts("spark-md5.js")

/*
* 当接收到主线程的消息时，读取文件内容，生成hash（由文件内容生成的hash是唯一的）
* */
self.onmessage = e => {
    // 文件切片数组
    const { chunkList } = e.data
    // 解析实例
    const spark = new self.SparkMD5.ArrayBuffer()
    let percentage = 0
    let count = 0

    /*
    * 递归工具函数：读取文件内容生成hash
    * */
    const loadNext = index => {
        const reader = new FileReader()
        // 读取文件内容（文件类型是ArrayBuffer）
        reader.readAsArrayBuffer(chunkList[index].chunk)
        reader.onload = e => {
            count++
            // 添加当前文件切片的解析结果
            spark.append(e.target.result)
            if(count === chunkList.length) {
                self.postMessage({
                    percentage: 100,
                    // 返回最终hash结果
                    hash: spark.end()
                })
                // 关闭 Web Worker
                self.close()
            }else{
                percentage += 100 / chunkList.length
                self.postMessage({
                    percentage
                })
                loadNext(count)
            }
        }
    }

    loadNext(0)
}
