import * as vscode from "vscode";
import { TaskParserBase } from "./task-parser-base";
import { AnsibleStep } from "./ansible-step";

export class TaskParser extends TaskParserBase {
    constructor(parent: AnsibleStep, fileUri: vscode.Uri) {
        super(parent, fileUri, undefined, 0);
    }
}