import * as vscode from 'vscode';
import { compress } from '../services/tinypng';
import { getImagesFromDirSync } from '../util';

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

export const compressFile = (context: vscode.ExtensionContext) => {
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
};

export const compressFolder = (context: vscode.ExtensionContext) => {
  let disposableCompressFolder: vscode.Disposable =
    vscode.commands.registerCommand(
      'vscode-tinypng.compressFolder',
      async (folder: vscode.Uri) => {
        let files = getImagesFromDirSync(folder.fsPath);
        await compressImageList(files);
      }
    );
  context.subscriptions.push(disposableCompressFolder);
};

export const compressFolderRecursive = (context: vscode.ExtensionContext) => {
  let disposableCompressFolderRecursive: vscode.Disposable =
    vscode.commands.registerCommand(
      'vscode-tinypng.compressFolderRecursive',
      async (folder: vscode.Uri) => {
        let files = await vscode.workspace.findFiles(
          new vscode.RelativePattern(folder.path, `**/*.{png,jpg,jpeg}`)
        );
        await compressImageList(files.map((val) => val.fsPath));
      }
    );
  context.subscriptions.push(disposableCompressFolderRecursive);
};
