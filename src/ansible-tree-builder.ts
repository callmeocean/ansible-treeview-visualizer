import * as vscode from "vscode";
import { AnsibleStep } from "./ansible-step";
import { PlaybookParser } from "./playbook-parser";
import { AnsibleStepType } from "./ansible-step-type";
import { TaskParser } from "./task-parser";

export class AnsibleTreeBuilder {
    public async build(): Promise<AnsibleStep[]> {
        let playbooks: AnsibleStep[] = [];

        let uris = await vscode.workspace.findFiles("*.yml");

        for (let i = 0; i < uris.length; i++) {
            let uri = uris[i];
            let parser = new PlaybookParser(uri);
            let step = await parser.parse();

            if (step) {
                playbooks.push(step);
            }
        }

        for (let i = 0; i < playbooks.length; i++) {
            const playbook = playbooks[i];

            await this.goOverNodes(playbook);
        }

        return playbooks;
    }

    private async goOverNodes(step: AnsibleStep) {
        for (let i = 0; i < step.childNodes.length; i++) {
            let childNode = step.childNodes[i];

            if (childNode.type === AnsibleStepType.Role) {
                let mainTaskUri: vscode.Uri | null = null;
                let metaUri: vscode.Uri | null = null;
                let mainTaskUris = await vscode.workspace.findFiles("roles/" + childNode.name + "/tasks/main.yml");

                if (mainTaskUris && mainTaskUris.length > 0) {
                    mainTaskUri = mainTaskUris[0];
                }

                let metaUris = await vscode.workspace.findFiles("roles/" + childNode.name + "/meta/main.yml");
                if (metaUris && metaUris.length > 0) {
                    metaUri = metaUris[0];
                }

                let roles: AnsibleStep[] | null = [];

                if (metaUri) {
                    let taskParser = new TaskParser(childNode, metaUri);
                    let dependentRoles = await taskParser.parse();
                    if (dependentRoles) {
                        roles = dependentRoles;
                    }
                }
                if (mainTaskUri) {
                    let taskParser = new TaskParser(childNode, mainTaskUri);
                    let mainRoles = await taskParser.parse();
                    if (mainRoles) {
                        roles = roles.concat(mainRoles);
                    }
                }
                if (!metaUri && !mainTaskUri) {
                    continue;
                }

                if (roles) {
                    childNode.childNodes = roles;
                }

                this.goOverNodes(childNode);
            }
        }

        return;
    }
}