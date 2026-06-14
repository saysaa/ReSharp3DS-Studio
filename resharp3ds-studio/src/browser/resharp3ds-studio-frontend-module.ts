import { Resharp3dsStudioCommandContribution, Resharp3dsStudioMenuContribution } from './resharp3ds-studio-contribution';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { ContainerModule } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser/messaging/ws-connection-provider';

import {
    ReSharp3DSBuildService,
    ReSharp3DSBuildServicePath
} from '../common/resharp3ds-build-protocol';

import {
    ReSharp3DSUpdateService,
    ReSharp3DSUpdateServicePath
} from '../common/resharp3ds-update-protocol';

import { ReSharp3DSCSharpLanguageContribution } from './resharp3ds-csharp-language';

export default new ContainerModule(bind => {
    bind(CommandContribution).to(Resharp3dsStudioCommandContribution);
    bind(MenuContribution).to(Resharp3dsStudioMenuContribution);

    bind(FrontendApplicationContribution)
        .to(ReSharp3DSCSharpLanguageContribution)
        .inSingletonScope();

    bind(ReSharp3DSBuildService).toDynamicValue(context =>
        WebSocketConnectionProvider.createProxy(
            context.container,
            ReSharp3DSBuildServicePath
        )
    ).inSingletonScope();

    bind(ReSharp3DSUpdateService).toDynamicValue(context =>
        WebSocketConnectionProvider.createProxy(
            context.container,
            ReSharp3DSUpdateServicePath
        )
    ).inSingletonScope();
});
