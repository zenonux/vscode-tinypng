// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { compress } from './tinypng';
/**
 * Function to compress a single image.
 * @param {Object} file
 */
const compressImage = (file: vscode.Uri) => {

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
    );
    statusBarItem.text = `Compressing file ${file.fsPath}...`;
    statusBarItem.show();
    compress(file.fsPath, (e: string | undefined) => {
        statusBarItem.hide();
        if (e) {
            vscode.window.showErrorMessage(e);
        } else {
            vscode.window.showInformationMessage(
                `Successfully compressed ${file.fsPath}`
            );
        }

    });
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposableCompressFile = vscode.commands.registerCommand('vscode-tinypng.compressFile', compressImage);
    context.subscriptions.push(disposableCompressFile);

    let disposableCompressFolder: vscode.Disposable = vscode.commands.registerCommand(
        'vscode-tinypng.compressFolder',
        (folder: vscode.Uri) => {
            vscode.workspace
                .findFiles(
                    new vscode.RelativePattern(
                        folder.path,
                        `**/*.{png,jpg,jpeg}`
                    )
                )
                .then((files: any) => files.forEach(compressImage));
        }
    );
    context.subscriptions.push(disposableCompressFolder);
}

// this method is called when your extension is deactivated
export function deactivate() { }
