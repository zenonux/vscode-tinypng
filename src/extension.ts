// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { compress } from './tinypng';
import { getImagesFromDirSync } from './util';

//wait vscode upgrade node version
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const compressImage = async (filePath: string) => {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.text = `compressing ${filePath}`;
  statusBarItem.show();
  let err = await compress(filePath);
  if (err) {
    vscode.window.showErrorMessage(err);
  } else {
    vscode.window.showInformationMessage(`compress ${filePath} success`);
  }
  statusBarItem.hide();
};

const compressImageList = async (files: string[]) => {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.show();
  let notCompressCount = files.length;
  for await (const file of files) {
    statusBarItem.text = `compressing ${file}, ${
      notCompressCount - 1 >= 0
        ? notCompressCount - 1 + ' files waiting for compress.'
        : ''
    }`;
    let err = await compress(file);
    notCompressCount--;
    if (err) {
      vscode.window.showErrorMessage(err);
    } else {
      vscode.window.showInformationMessage(`compress ${file} success.`);
    }
  }
  statusBarItem.hide();
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposableCompressFile = vscode.commands.registerCommand(
    'vscode-tinypng.compressFile',
    (file: vscode.Uri) => compressImage(file.fsPath)
  );
  context.subscriptions.push(disposableCompressFile);

  let disposableCompressFolder: vscode.Disposable =
    vscode.commands.registerCommand(
      'vscode-tinypng.compressFolder',
      async (folder: vscode.Uri) => {
        let files = getImagesFromDirSync(folder.fsPath);
        await compressImageList(files);
      }
    );
  context.subscriptions.push(disposableCompressFolder);

  let disposableCompressFolderRecursive: vscode.Disposable =
    vscode.commands.registerCommand(
      'vscode-tinypng.compressFolderRecursive',
      async (folder: vscode.Uri) => {
        let files = await vscode.workspace.findFiles(
          new vscode.RelativePattern(folder.path, `**/*.{png,jpg,jpeg,webp}`)
        );
        await compressImageList(files.map(val=> val.fsPath));
      }
    );
  context.subscriptions.push(disposableCompressFolderRecursive);
}

// this method is called when your extension is deactivated
export function deactivate() {}
