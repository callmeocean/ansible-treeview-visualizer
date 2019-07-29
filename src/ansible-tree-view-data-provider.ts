import * as vscode from "vscode";
import { AnsibleStep } from "./ansible-step";
import { AnsibleTreeBuilder } from "./ansible-tree-builder";

export class AnsibleTreeviewDataProvider implements vscode.TreeDataProvider<AnsibleStep> {
    trees: AnsibleStep[] = [];
    private promise: Promise<AnsibleStep[]>;
    private treeItems: { [id: string]: vscode.TreeItem; } = {};

    constructor() {
        let treeBuilder = new AnsibleTreeBuilder();
        this.promise = treeBuilder.build().then(trees => {
            this.trees = trees;

            return trees;
        });
    }
    getChildren(element?: AnsibleStep): vscode.ProviderResult<AnsibleStep[]> {
        if (!element) {
            return this.promise;
        }

        return element.childNodes;
    }
    getTreeItem(element: AnsibleStep): vscode.TreeItem {
        let id = element.id.toString();
        if (this.treeItems[id]) {
            return this.treeItems[id];
        }

        const treeItem = new vscode.TreeItem(element.name,
            element.childNodes.length ?
                vscode.TreeItemCollapsibleState.Collapsed :
                vscode.TreeItemCollapsibleState.None);
        treeItem.id = id;

        if (element.uri) {
            treeItem.command = {
                command: "ansibleTreeview.goTo",
                arguments: [
                    element.uri,
                    element.line,
                    element.column,
                    element.name.length
                ],
                title: "Go to file"
            };
        }

        this.treeItems[treeItem.id] = treeItem;

        return treeItem;
    }
    getParent(element: AnsibleStep): vscode.ProviderResult<AnsibleStep> {
        return element.parent;
    }
}