/* eslint-disable @typescript-eslint/naming-convention */

import * as fs from 'fs';
import * as https from 'https';
import { URL } from 'url';
import {isTinyImgFile} from './util';


export function compress(filePath: string, done: (e?: string) => void) {
    try {
        if (!fs.existsSync(filePath)) {
            return console.error('文件不存在！');
        }
        handleImgFile(filePath,done);
    } catch (e: any) {
        console.error(e);
        done(e);
    }
}

function handleImgFile(file: string,done: (e?: string) => void) {
    if (isTinyImgFile(file)) {
        fileUpload(file,done);
    } else {
        throw new Error('图片格式不正确！');
    }
}


/**
 * 请求体
 * @param {*}
 * @returns {object} 请求体
 */
function buildRequestParams() {
    return {
        method: 'POST',
        hostname: 'tinypng.com',
        path: '/web/shrink',
        headers: {
            rejectUnauthorized: false,
            'X-Forwarded-For': getRandomIP(),
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 '
                + '(KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
        }
    };
}

/**
 * @description 生成随机xff头
 * @return {string} xff header
 */
function getRandomIP() {
    return Array.from(Array(3))
        .map(() => parseInt(String(Math.random() * 255), 10))
        .concat([new Date().getTime() % 255])
        .join('.');
}

function fileUpload(imgPath: string,done: (e?: string) => void) {
    let options: any = buildRequestParams();
    const req = https.request(options, res => {
        res.on('data', buffer => {
            const postInfo = JSON.parse(buffer.toString());
            if (postInfo.error) {
                throw new Error(`压缩失败！\n 当前文件：${imgPath} \n ${postInfo.message}`);
            }
            else {
                fileUpdate(imgPath, postInfo,done);
            }
        });
    });
    req.write(fs.readFileSync(imgPath), 'binary');
    req.on('error', e => {
        throw new Error(`请求错误! \n 当前文件：${imgPath} \n, ${e})`);
    });
    req.end();

}

async function fileUpdate(entryImgPath: string, info: {
    error?: any
    output: {
        url: string
    },
},done: (e?: string) => void) {
    const options = new URL(info.output.url);
    const req = https.request(options, res => {
        let body = '';
        res.setEncoding('binary');
        res.on('data', data => (body += data));
        res.on('end', () => {
            fs.writeFile(entryImgPath, body, 'binary', err => {
                if (err) {
                    throw new Error('更新压缩失败');
                }else{
                    done();
                }
            });
        });
    });
    req.on('error', e => {
        throw new Error('下载压缩图片失败');
    });
    req.end();
}

