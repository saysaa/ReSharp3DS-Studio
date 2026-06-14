import { ContainerModule } from '@theia/core/shared/inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core/lib/common/messaging';

import {
    ReSharp3DSBuildService,
    ReSharp3DSBuildServicePath
} from '../common/resharp3ds-build-protocol';
import { ReSharp3DSBuildServiceImpl } from './resharp3ds-build-service';

import {
    ReSharp3DSUpdateService,
    ReSharp3DSUpdateServicePath
} from '../common/resharp3ds-update-protocol';
import { ReSharp3DSUpdateServiceImpl } from './resharp3ds-update-service';

export default new ContainerModule(bind => {
    bind(ReSharp3DSBuildService).to(ReSharp3DSBuildServiceImpl).inSingletonScope();

    bind(ConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler(
            ReSharp3DSBuildServicePath,
            () => context.container.get(ReSharp3DSBuildService)
        )
    ).inSingletonScope();

    bind(ReSharp3DSUpdateService).to(ReSharp3DSUpdateServiceImpl).inSingletonScope();

    bind(ConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler(
            ReSharp3DSUpdateServicePath,
            () => context.container.get(ReSharp3DSUpdateService)
        )
    ).inSingletonScope();
});
