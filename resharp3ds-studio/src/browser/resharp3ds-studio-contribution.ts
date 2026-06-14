import { injectable, inject } from '@theia/core/shared/inversify';
import {
    Command,
    CommandContribution,
    CommandRegistry,
    MenuContribution,
    MenuModelRegistry,
    MessageService
} from '@theia/core';
import { CommonMenus } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser';

import { ReSharp3DSBuildService } from '../common/resharp3ds-build-protocol';
import { ReSharp3DSUpdateService } from '../common/resharp3ds-update-protocol';

export const ReSharp3DSBuildCommand: Command = {
    id: 'resharp3ds.build.pe',
    label: 'ReSharp3DS: Build PE'
};

export const ReSharp3DSCheckUpdatesCommand: Command = {
    id: 'resharp3ds.check.updates',
    label: 'ReSharp3DS: Check for Updates'
};

@injectable()
export class Resharp3dsStudioCommandContribution implements CommandContribution {

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @inject(WorkspaceService)
    protected readonly workspaceService!: WorkspaceService;

    @inject(ReSharp3DSBuildService)
    protected readonly buildService!: ReSharp3DSBuildService;

    @inject(ReSharp3DSUpdateService)
    protected readonly updateService!: ReSharp3DSUpdateService;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(ReSharp3DSBuildCommand, {
            execute: async () => {
                this.messageService.info('Build started.');

                try {
                    const roots = await this.workspaceService.roots;

                    if (roots.length === 0) {
                        this.messageService.error('No project folder is open.');
                        return;
                    }

                    const root = roots[0].resource;
                    const projectName = root.path.base;
                    const outputName = `${projectName}.pe`;

                    this.messageService.info(`Project: ${projectName}`);

                    const result = await this.buildService.build({
                        projectUri: root.toString(),
                        outputName
                    });

                    console.log(result.log);

                    if (result.success) {
                        this.messageService.info(result.message);
                    } else {
                        this.messageService.error(result.message);
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    console.error(error);
                    this.messageService.error(`Build failed: ${message}`);
                }
            }
        });

        registry.registerCommand(ReSharp3DSCheckUpdatesCommand, {
            execute: async () => {
                try {
                    this.messageService.info('Checking for updates...');

                    const info = await this.updateService.checkForUpdates();

                    if (info.updateAvailable) {
                        this.messageService.info(
                            `Update available: ${info.currentVersion} → ${info.latestVersion}`
                        );

                        if (info.assetName) {
                            console.log(`Update asset: ${info.assetName}`);
                        }

                        if (info.assetDownloadUrl) {
                            console.log(`Download URL: ${info.assetDownloadUrl}`);
                        }
                    } else {
                        this.messageService.info(
                            `ReSharp3DS Studio is up to date (${info.currentVersion}).`
                        );
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    console.error(error);
                    this.messageService.error(`Update check failed: ${message}`);
                }
            }
        });
    }
}

@injectable()
export class Resharp3dsStudioMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: ReSharp3DSBuildCommand.id,
            label: ReSharp3DSBuildCommand.label
        });

        menus.registerMenuAction(CommonMenus.HELP, {
            commandId: ReSharp3DSCheckUpdatesCommand.id,
            label: ReSharp3DSCheckUpdatesCommand.label
        });
    }
}
