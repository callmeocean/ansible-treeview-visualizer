// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PlaybookParser } from "./playbook-parser";
import { AnsibleStep } from './ansible-step';
import { AnsibleTreeBuilder } from './ansible-tree-builder';
import { AnsibleTreeView } from './ansible-tree-view';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	let treeview = new AnsibleTreeView(context);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', (uri, line, column, length) => {
		vscode.window.showTextDocument(uri, {
			selection: new vscode.Range(line, column, line, column + length)
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
