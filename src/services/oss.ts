import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
export default class Oss {
  static async newConfig(basePath: string) {
    const configPath = path.join(basePath, '.vscode/tinypng.json');
    let exist = await fse.pathExists(configPath);
    if (exist) {
      await vscode.window.showTextDocument(vscode.Uri.file(configPath));
      return;
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
    await vscode.window.showTextDocument(vscode.Uri.file(configPath));
  }
}
