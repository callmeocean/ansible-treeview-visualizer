import * as vscode from "vscode";
import { AnsibleStep } from "./ansible-step";
import { AnsibleStepType } from "./ansible-step-type";
import { parentPort } from "worker_threads";

export class TaskParserBase {
    fileUri?: vscode.Uri;
    document?: vscode.TextDocument;
    startLine: number;
    isInSetFactBlock: boolean;
    isInIncludeRoleBlock: boolean;
    isInDependenciesBlock: boolean;
    parent: AnsibleStep;

    constructor(parent: AnsibleStep, fileUri?: vscode.Uri, document?: vscode.TextDocument, startLine?: number) {
        this.fileUri = fileUri;
        this.document = document;
        this.startLine = startLine || 0;
        this.isInSetFactBlock = false;
        this.isInIncludeRoleBlock = false;
        this.isInDependenciesBlock = false;
        this.parent = parent;
    }

    public async parse(): Promise<AnsibleStep[] | null> {
        if (!this.document) {
            if (!this.fileUri) {
                throw new Error("Either document or fileUri should be passed");
            }
            this.document = await vscode.workspace.openTextDocument(this.fileUri);
        }

        let tasks: AnsibleStep[] = [];

        let variablesNode = new AnsibleStep("vars", undefined, AnsibleStepType.Text, 0, 0, this.parent);

        for (let i = this.startLine; i < this.document.lineCount; i++) {
            let line = this.document.lineAt(i).text;
            var step = this.parseLine(line, undefined, this.document.uri, i);
            if (step) {
                switch (step.type) {
                    case AnsibleStepType.Role:
                        tasks.push(step);
                        break;

                    case AnsibleStepType.Variable:
                        variablesNode.childNodes.push(step);
                        break;

                    default:
                        continue;
                        break;
                }
            }
        }

        if (variablesNode.childNodes && variablesNode.childNodes.length > 0) {
            tasks.push(variablesNode);
        }

        return tasks;
    }

    public parseLine(line: string, linePrefix: string = "",
        fileUri: vscode.Uri, lineIndex: number): AnsibleStep | null {
        let trimmedLine = line.trim();

        let nextLevelLineSpacePrefix = linePrefix + "    ";

        if (!line.startsWith(nextLevelLineSpacePrefix)) {
            this.isInSetFactBlock = this.isInIncludeRoleBlock = false;
        }

        if (trimmedLine.endsWith("set_fact:")) {
            this.isInSetFactBlock = true;
        } else if (trimmedLine.endsWith("include_role:")) {
            this.isInIncludeRoleBlock = true;
        } else if (line.trimRight() === "dependencies:") {
            this.isInDependenciesBlock = true;
        }

        let trimedLineLengthDifference = line.length - line.trimLeft().length;

        if (this.isInSetFactBlock) {
            let column = trimedLineLengthDifference;
            if (nextLevelLineSpacePrefix.length === column) {
                return new AnsibleStep(
                    trimmedLine.substring(0, trimmedLine.indexOf(':')),
                    fileUri, AnsibleStepType.Variable, lineIndex, column, this.parent);
            }
        }
        if (this.isInIncludeRoleBlock && trimmedLine.startsWith("name:")) {
            let column = trimmedLine.indexOf(':') + 2;
            return new AnsibleStep(
                trimmedLine.substring(column),
                fileUri, AnsibleStepType.Role, lineIndex, column + trimedLineLengthDifference, this.parent);
        }
        if (this.isInDependenciesBlock && trimmedLine.startsWith("- name:")) {
            let column = trimmedLine.indexOf(':') + 2;
            return new AnsibleStep(
                trimmedLine.substring(column),
                fileUri, AnsibleStepType.Role, lineIndex, column + trimedLineLengthDifference, this.parent);
        }
        if (this.isInDependenciesBlock && line.startsWith("- ")) {
            return new AnsibleStep(
                trimmedLine.substring(2),
                fileUri, AnsibleStepType.Role, lineIndex, 2, this.parent);
        }
        return null;
    }
}