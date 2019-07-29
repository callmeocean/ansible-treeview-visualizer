import * as vscode from 'vscode';
import { AnsibleTreeView } from './ansible-tree-view';

export function activate(context: vscode.ExtensionContext) {
	let treeview = new AnsibleTreeView(context);
}

export function deactivate() { }
