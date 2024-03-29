import axios from "axios";
import {message} from "antd";

const service = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 8000,

})

service.interceptors.request.use((config) => {
    config.headers['Authorization'] = localStorage.getItem('token')
    // config.headers['Content-Type'] = 'application/json'
    return config
}, (error) => {
    return Promise.reject(error)
})

service.interceptors.response.use((res) => {
    return Promise.resolve(res.data)
}, (error) => {
    return Promise.reject(error)
})

const request = (url: string, method: string, data: unknown, options?: Array<object>) => {
    // console.log('import.meta.env.BASE_URL',import.meta.env.VITE_BASE_URL)
    return new Promise((resolve, reject) => {
        service({
            method,
            url,
            data,
            ...options,
        }).then(res => {
            resolve(res)
        }).catch(err => {
            console.log('err', err)
            message.error(err.message)
            reject(err)
        })
    })
}

export const postApi = (url: string, data: unknown, options?: Array<object>) => {
    console.log(import.meta.env.BASE_URL,'import.meta.env.BASE_URL,')
    return request(url, 'POST', data, options)
}


export default service
