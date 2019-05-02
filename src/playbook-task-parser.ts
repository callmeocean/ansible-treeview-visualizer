import * as vscode from "vscode";
import { TaskParserBase } from "./task-parser-base";
import { AnsibleStep } from "./ansible-step";

export class PlaybookTaskParser extends TaskParserBase {
    constructor(parent: AnsibleStep, document: vscode.TextDocument) {
        super(parent, undefined, document);
    }
}