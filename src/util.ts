import * as fs from "fs";
import * as path from "path";

const conf = {
  exts: [".jpg", ".png", ".jpeg", ".webp"],
  max: 5000000,
};

export function getImagesFromDirSync(dirPath: string) {
  let fileList: string[] = [];
  fs.readdirSync(dirPath).forEach((file) => {
    const fullFilePath = path.join(dirPath, file);
    if (isTinyImgFile(fullFilePath)) {
      fileList.push(fullFilePath);
    }
  });
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
