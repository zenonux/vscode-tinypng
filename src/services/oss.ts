import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
export default class Oss {

  static newConfig(basePath: string) {
    const configPath =  path.join(basePath, 'tinypng.json');
    return fse.pathExists(configPath).then(async (exist) => {
      if (exist) {
        return vscode.window.showTextDocument(vscode.Uri.file(configPath));
      }
      await fse.outputJson(
        configPath,
        {
          name: '',
          region: '',
          accessKeyId: '',
          accessKeySecret: '',
          bucket: '',
        },
        { spaces: 4 }
      );
      return await vscode.window.showTextDocument(vscode.Uri.file(configPath));
    });
  }
}
