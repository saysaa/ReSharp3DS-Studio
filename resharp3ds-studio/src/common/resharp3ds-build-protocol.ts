export const ReSharp3DSBuildServicePath = '/services/resharp3ds-build';

export const ReSharp3DSBuildService = Symbol('ReSharp3DSBuildService');

export interface ReSharp3DSBuildRequest {
    projectUri: string;
    outputName: string;
}

export interface ReSharp3DSBuildResult {
    success: boolean;
    message: string;
    log: string;
}

export interface ReSharp3DSBuildService {
    build(request: ReSharp3DSBuildRequest): Promise<ReSharp3DSBuildResult>;
}
