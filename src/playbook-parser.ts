import * as vscode from 'vscode';
import { AnsibleStep } from './ansible-step';
import { AnsibleStepType } from './ansible-step-type';
import { PlaybookTaskParser } from './playbook-task-parser';
import { fileURLToPath } from 'url';

export class PlaybookParser {
    private hasStartingDashes: boolean;
    private hasHosts: boolean;
    private isVarsSection: boolean;
    private isRolesSection: boolean;
    private isTasksSection: boolean;
    fileUri: vscode.Uri;

    constructor(fileUri: vscode.Uri) {
        this.hasStartingDashes = this.hasHosts =
            this.isVarsSection = this.isRolesSection =
            this.isTasksSection = false;
        this.fileUri = fileUri;
    }

    /**
     * parse
    */
    public async parse(): Promise<AnsibleStep | null> {
        const document = await vscode.workspace.openTextDocument(this.fileUri);

        let playbook = new AnsibleStep(document.fileName.substring(document.fileName.lastIndexOf('\\') + 1),
            this.fileUri, AnsibleStepType.Playbook);
        let variablesNode = new AnsibleStep("vars", undefined, AnsibleStepType.Text, 0, 0, playbook);

        let tasksParser = new PlaybookTaskParser(playbook, document);
        for (let i = 0; i < document.lineCount; i++) {
            let line = document.lineAt(i).text;

            let trimmedLine = line.trimLeft();
            if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
                continue;
            }

            if (!this.hasStartingDashes) {
                if (trimmedLine.trimRight() !== "---") {
                    return null;
                }
                this.hasStartingDashes = true;
                continue;
            }

            if (!this.hasHosts) {
                if (!trimmedLine.startsWith('- hosts:')) {
                    return null;
                }
                this.hasHosts = true;
                continue;
            }

            let trimedLineLengthDifference = line.length - trimmedLine.length;

            if (this.isVarsSection) {
                if (trimmedLine.length > 0 && !line.startsWith("    ")) {
                    this.isVarsSection = false;
                } else if (trimedLineLengthDifference === 4) {
                    variablesNode.childNodes.push(
                        new AnsibleStep(trimmedLine.substring(0, trimmedLine.indexOf(':')),
                            this.fileUri, AnsibleStepType.Variable, i, 4, playbook));
                    continue;
                }
            }

            if (this.isRolesSection || this.isTasksSection) {
                if (trimmedLine.length > 0 && !line.startsWith("    ")
                    && !line.startsWith('  -')) {
                    this.isRolesSection = this.isTasksSection = false;
                }
            }

            if (this.isRolesSection && trimmedLine.startsWith("- role:")) {
                let column = trimmedLine.indexOf(':') + 2;
                playbook.childNodes.push(
                    new AnsibleStep(trimmedLine.substring(column).trim(),
                        this.fileUri, AnsibleStepType.Role, i, column + trimedLineLengthDifference, playbook)
                );
                continue;
            }

            if (this.isTasksSection) {
                var step = tasksParser.parseLine(line, "  ", this.fileUri, i);
                if (step) {
                    switch (step.type) {
                        case AnsibleStepType.Role:
                            playbook.childNodes.push(step);
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

            switch (line.trimRight()) {
                case "  roles:":
                    this.isRolesSection = true;
                    break;
                case "  tasks:":
                    this.isTasksSection = true;
                    break;
                case "  vars:":
                    this.isVarsSection = true;
                    break;
            }
        }

        if (variablesNode.childNodes && variablesNode.childNodes.length > 0) {
            playbook.childNodes.push(variablesNode);
        }

        return playbook;
    }
}