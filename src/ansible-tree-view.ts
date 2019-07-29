import * as vscode from "vscode";
import { AnsibleStep } from "./ansible-step";
import { AnsibleTreeviewDataProvider } from "./ansible-tree-view-data-provider";

export class AnsibleTreeView {
	searchBox: vscode.InputBox;
	view: vscode.TreeView<AnsibleStep>;
	provider: AnsibleTreeviewDataProvider;
	private isInSearchMode: boolean = false;
	private searchResults: AnsibleStep[] = [];
	private searchResultIndex: number = 0;

	constructor(context: vscode.ExtensionContext) {
		this.provider = new AnsibleTreeviewDataProvider();

		this.searchBox = vscode.window.createInputBox();

		this.configureSearchBox();
		this.view = vscode.window
			.createTreeView('ansibleTreeView',
				{ treeDataProvider: this.provider, showCollapseAll: true });


		let disposableGoTo = vscode.commands.registerCommand('ansibleTreeview.goTo', (uri, line, column, length) => {
			vscode.window.showTextDocument(uri, {
				selection: new vscode.Range(line, column, line, column + length)
			});
		});

		let disposableSearch = vscode.commands.registerCommand('ansibleTreeview.search', (args) => {
			this.showSearchInput();
		});

		let disposableNext = vscode.commands.registerCommand('ansibleTreeview.nextSearchResult', (args) => {
			this.searchResultIndex++;
			if (this.searchResultIndex >= this.searchResults.length) {
				this.searchResultIndex = 0;
			}

			this.view.reveal(this.searchResults[this.searchResultIndex], { focus: true, expand: true, select: true });
		});

		let disposablePrevious = vscode.commands.registerCommand('ansibleTreeview.previousSearchResult', (args) => {
			this.searchResultIndex--;
			if (this.searchResultIndex < 0) {
				this.searchResultIndex = this.searchResults.length - 1;
			}

			this.view.reveal(this.searchResults[this.searchResultIndex], { focus: true, expand: true, select: true });
		});

		context.subscriptions.push(disposableGoTo);
		context.subscriptions.push(disposableSearch);
		context.subscriptions.push(disposableNext);
		context.subscriptions.push(disposablePrevious);
	}

	private configureSearchBox() {
		this.searchBox.title = "Search in Ansible tree";

		this.searchBox.onDidAccept(async () => {
			await this.search();
		});
	}

	private async search() {
		this.isInSearchMode = true;
		this.searchResults = [];
		this.searchResultIndex = 0;

		var searchText = this.searchBox.value;

		for (let i = 0; i < this.provider.trees.length; i++) {
			let root = this.provider.trees[i];
			await this.searchNode(root, searchText);
		}

		if (this.searchResults.length > 0) {
			await this.view.reveal(this.searchResults[0], { focus: true, expand: true, select: true });
		}
	}

	private async searchNode(node: AnsibleStep, text: string) {
		if (node.name.indexOf(text) > -1) {
			this.searchResults.push(node);
		}

		for (let i = 0; i < node.childNodes.length; i++) {
			let childNode = node.childNodes[i];
			await this.searchNode(childNode, text);
		}
	}

	showSearchInput() {
		this.searchBox.show();
	}
}