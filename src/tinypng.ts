/* eslint-disable @typescript-eslint/naming-convention */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { URL } from 'url';
const conf = {
    exts: ['.jpg', '.png', '.jpeg'],
    max: 5000000,
};

/**
 * @description 过滤待处理文件夹，得到待处理文件列表
 * @param {*} folder 待处理文件夹
 * @param {string} imgEntryPath 待处理文件列表
 * @return {*} void
 */
export function compress(imgEntryPath: string, done: (e?: string) => void) {
    try {
        const filePath = path.join(imgEntryPath);
        if (!fs.existsSync(filePath)) {
            return console.error('文件不存在！');
        }
        const stats = fs.statSync(filePath);
        handleImgFile(stats.isFile(), stats.size, filePath);
        done();
    } catch (e: any) {
        done(e);
    }
}

function handleImgFile(isFile: boolean, fileSize: number, file: string) {
    if (isTinyImgFile(isFile, fileSize, file)) {
        fileUpload(file);
    } else {
        throw new Error('图片格式不正确！');
    }
}

// 过滤文件安全性/大小限制/后缀名
function isTinyImgFile(isFile: boolean, fileSize: number, file: string) {
    return isFile
        && conf.exts.includes(path.extname(file))
        && fileSize <= conf.max;
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

function fileUpload(imgPath: string) {
    let options: any = buildRequestParams();
    const req = https.request(options, res => {
        res.on('data', buffer => {
            const postInfo = JSON.parse(buffer.toString());
            if (postInfo.error) {
                throw new Error(`压缩失败！\n 当前文件：${imgPath} \n ${postInfo.message}`);
            }
            else {
                fileUpdate(imgPath, postInfo);
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
}) {
    const options = new URL(info.output.url);
    const req = https.request(options, res => {
        let body = '';
        res.setEncoding('binary');
        res.on('data', data => (body += data));
        res.on('end', () => {
            fs.writeFile(entryImgPath, body, 'binary', err => {
                if (err) {
                    throw new Error('更新压缩失败');
                }
            });
        });
    });
    req.on('error', e => {
        throw new Error('下载压缩图片失败');
    });
    req.end();
}

