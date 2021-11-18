import axios from 'axios'

const host = process.env.VUE_APP_API_HOST;
export function post(path: string, data: any) {
    return axios({
        method: 'post',
        baseURL: host,
        url: path,
        data: data
    });
}

export function get(path: string, params: any) {
    return axios({
        method: 'get',
        baseURL: host,
        url: path,
        params: params
    });
}

export function requestdelete(path: string, data: any) {
    return axios({
        method: 'delete',
        baseURL: host,
        url: path,
        data: data
    });
}

export function requestput(path: string, data: any) {
    return axios({
        method: 'put',
        baseURL: host,
        url: path,
        data: data
    });
}

