/* eslint-disable @typescript-eslint/naming-convention */

import * as fs from 'fs';
import * as https from 'https';
import { URL } from 'url';
import { isTinyImgFile } from './util';

interface PostInfo {
  error?: any
  output: {
    url: string
  }
}

export async function compress(filePath: string):Promise<string | undefined> {
  if (isTinyImgFile(filePath)) {
    try {
      let postInfo = await fileUpload(filePath);
      await fileUpdate(filePath, postInfo);
    } catch (e: any) {
      console.error(e);
      return 'compress image failed.';
    }
  } else {
    return 'file is not valid.';
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
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
    },
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

async function fileUpload(imgPath: string): Promise<PostInfo> {
  return new Promise((resolve, reject) => {
    let options: any = buildRequestParams();
    const req = https.request(options, (res) => {
      res.on('data', (buffer) => {
        const postInfo = JSON.parse(buffer.toString());
        if (postInfo.error) {
          reject(postInfo.error);
        } else {
          resolve(postInfo);
        }
      });
    });
    req.write(fs.readFileSync(imgPath), 'binary');
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
}

async function fileUpdate(entryImgPath: string, info: PostInfo): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = new URL(info.output.url);
    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('binary');
      res.on('data', (data) => (body += data));
      res.on('end', () => {
        fs.writeFile(entryImgPath, body, 'binary', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
}
