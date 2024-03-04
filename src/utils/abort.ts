import service from "@/utils/request.ts";

type ListItem =  {
    abortController: AbortController,
    promise: Promise<any>,
    formData: FormData,
    callBack?: Function
}

class AboutRequest {
    // status
    private list: Map<string, ListItem> = new Map()
    private count = 0

    /*
    * @param {formData} 需要上传的文件数据
    * @param {callBack} upload请求成功后的回调函数
    * @return {promise} 上传请求promise实例，给文件切片最终的Promise.all使用
    * */
    public setAbortController(formData: FormData, callBack?: Function): Promise<any>{
        /*
        * 将每个取消实例的signal属性，添加到api请求config的signal中
        * 这一步就将取消实例和api请求，建立起了个一一对应关系
        * 即后续通过取消实例，能唯一取消一个请求
        * */
        const controller = new AbortController()
        const signal = controller.signal
        const pId = formData.get('index')

        const p = service.post('/upload', formData, {signal})
            .then(() => {
                callBack && callBack()
                this.removeAbortController(pId as string)
            })
        this.list.set(pId as string, {
            abortController: controller,
            promise: p,
            formData,
            callBack
        })

        return p;
    }

    /*
    * 请求成功后，需要删除 promiseList 和 abortControllerList 中的这一条请求记录
    * 剩下的记录即可作为恢复上传的数据
    * */
    public removeAbortController(pId: string){
        this.list.delete(pId)
    }

    /*
    * 取出剩下的未请求成功的promise
    * */
    public getList(){
        return this.list
    }

    /*
    * 暂停剩余的<文件切片上传>请求
    * abort是永久性的，即相应的promise请求取消后，不可再发起请求
    * */
    public pause(){
        this.list.forEach((item: ListItem) => {
            item.abortController.abort()
        })
    }

    /*
    * 恢复上传：将剩余的promise请求重新进行AbortController绑定
    * */
    public continue(){
        this.list.forEach((value: ListItem, key) => {
            const controller = new AbortController()
            const signal = controller.signal
            value.abortController = controller
            value.promise = service.post('/upload', value.formData, {signal})
                .then(() => {
                    value.callBack && value.callBack()
                    this.removeAbortController(key)
                })

        })
    }

    public setCount(){
        this.count++
    }

    public getCount(){
        return this.count
    }

}

export default new AboutRequest()
