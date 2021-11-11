import * as fs from 'fs';
import * as path from 'path';
import { Uri } from 'vscode';

const conf = {
  exts: ['.jpg', '.png', '.jpeg'],
  max: 5000000,
};

export function getImagesFromDirSync(dirPath: string) {
  let fileList: string[] = [];

  let dirUri=Uri.file(dirPath);

  fs.readdirSync(dirUri.fsPath).forEach((file) => {
    const fullFilePath = path.join(dirUri.fsPath, file);
    if (isTinyImgFile(fullFilePath)) {
      fileList.push(fullFilePath);
    }
  });
  console.log(3,fileList);
  return fileList;
}

export function isTinyImgFile(filePath: string) {
  const fileStat = fs.statSync(filePath);
  return (
    fileStat.isFile() &&
    conf.exts.includes(path.extname(filePath)) &&
    fileStat.size <= conf.max
  );
}
