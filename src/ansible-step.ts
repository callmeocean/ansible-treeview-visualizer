import { AnsibleStepType } from "./ansible-step-type";
import { Guid } from "guid-typescript";
import * as vscode from "vscode";

export class AnsibleStep {
    name: string;
    uri: vscode.Uri | undefined;
    type: AnsibleStepType;
    childNodes: AnsibleStep[];
    parent?: AnsibleStep;
    id: Guid;
    line: number;
    column: number;

    constructor(name: string, uri: vscode.Uri | undefined,
        type: AnsibleStepType, line: number = 0, column: number = 0, parent?: AnsibleStep) {
        this.id = Guid.create();
        this.name = name;
        this.uri = uri;
        this.type = type;
        this.childNodes = [];
        this.parent = parent;
        this.line = line;
        this.column = column;
    }
}