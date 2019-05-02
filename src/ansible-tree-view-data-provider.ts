import * as vscode from "vscode";
import { AnsibleStep } from "./ansible-step";
import { generateKeyPairSync } from "crypto";

export class AnsibleTreeviewDataProvider implements vscode.TreeDataProvider<AnsibleStep> {
    trees: AnsibleStep[];

    constructor(trees: AnsibleStep[]) {
        this.trees = trees;
    }
    getChildren(element?: AnsibleStep): vscode.ProviderResult<AnsibleStep[]> {
        let children: string[];
        if (!element) {
            return this.trees;
        }

        return element.childNodes;
    }
    getTreeItem(element: AnsibleStep): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.name,
            element.childNodes.length ?
                vscode.TreeItemCollapsibleState.Collapsed :
                vscode.TreeItemCollapsibleState.None);
        treeItem.id = element.id.toString();

        if (element.uri) {
            treeItem.command = {
                command: "extension.helloWorld",
                arguments: [
                    element.uri,
                    element.line,
                    element.column,
                    element.name.length
                ],
                title: "Go to file"
            };
        }
        return treeItem;
    }
    getParent(element: AnsibleStep): vscode.ProviderResult<AnsibleStep> {
        return element.parent;
    }
}