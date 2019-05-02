import * as vscode from "vscode";
import { AnsibleStep } from "./ansible-step";
import { AnsibleTreeviewDataProvider } from "./ansible-tree-view-data-provider";
import { AnsibleTreeBuilder } from "./ansible-tree-builder";

export class AnsibleTreeView {
	constructor(context: vscode.ExtensionContext) {
		let treeBuilder = new AnsibleTreeBuilder();

		treeBuilder.build().then(trees => {
			const view = vscode.window
				.createTreeView('ansibleTreeView', 
				{ treeDataProvider: new AnsibleTreeviewDataProvider(trees), showCollapseAll: true });
			// vscode.commands.registerCommand('testView.reveal', async () => {
			// 	const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
			// 	if (key) {
			// 		await view.reveal({ key }, { focus: true, select: false, expand: true });
			// 	}
			// });
		});
	}
}