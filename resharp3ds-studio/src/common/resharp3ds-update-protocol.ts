export const ReSharp3DSUpdateServicePath = '/services/resharp3ds-update';

export const ReSharp3DSUpdateService = Symbol('ReSharp3DSUpdateService');

export interface ReSharp3DSUpdateInfo {
    currentVersion: string;
    latestVersion: string;
    updateAvailable: boolean;
    releaseName: string;
    releaseUrl: string;
    assetName?: string;
    assetDownloadUrl?: string;
}

export interface ReSharp3DSUpdateService {
    checkForUpdates(): Promise<ReSharp3DSUpdateInfo>;
}
