import { injectable } from '@theia/core/shared/inversify';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import {
    ReSharp3DSUpdateInfo,
    ReSharp3DSUpdateService
} from '../common/resharp3ds-update-protocol';

const GitHubOwner = 'saysaa';
const GitHubRepo = 'ReSharp3DS-Studio';

@injectable()
export class ReSharp3DSUpdateServiceImpl implements ReSharp3DSUpdateService {

    async checkForUpdates(): Promise<ReSharp3DSUpdateInfo> {
        const currentVersion = this.getCurrentVersion();
        const release = await this.getLatestRelease();

        const latestVersion = this.cleanVersion(release.tag_name);
        const updateAvailable = this.compareVersions(latestVersion, currentVersion) > 0;

        const asset = Array.isArray(release.assets)
            ? release.assets.find((item: any) =>
                typeof item.name === 'string' &&
                (
                    item.name.endsWith('.zip') ||
                    item.name.endsWith('.AppImage') ||
                    item.name.endsWith('.exe')
                )
            )
            : undefined;

        return {
            currentVersion,
            latestVersion,
            updateAvailable,
            releaseName: release.name || release.tag_name,
            releaseUrl: release.html_url,
            assetName: asset?.name,
            assetDownloadUrl: asset?.browser_download_url
        };
    }

    private getCurrentVersion(): string {
        const packageJson = this.findRootPackageJson();
        const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));

        return this.cleanVersion(json.version || '0.0.0');
    }

    private findRootPackageJson(): string {
        const candidates = [
            path.resolve(process.cwd(), '..', 'package.json'),
            path.resolve(process.cwd(), 'package.json'),
            path.resolve(__dirname, '..', '..', '..', 'package.json')
        ];

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }

        throw new Error(`package.json not found. Checked:\n${candidates.join('\n')}`);
    }

    private async getLatestRelease(): Promise<any> {
        const url = `https://api.github.com/repos/${GitHubOwner}/${GitHubRepo}/releases/latest`;

        return JSON.parse(await this.downloadText(url, {
            'User-Agent': 'ReSharp3DS-Studio',
            'Accept': 'application/vnd.github+json'
        }));
    }

    private downloadText(url: string, headers: Record<string, string>): Promise<string> {
        return new Promise((resolve, reject) => {
            https.get(url, { headers }, response => {
                if (
                    response.statusCode &&
                    response.statusCode >= 300 &&
                    response.statusCode < 400 &&
                    response.headers.location
                ) {
                    this.downloadText(response.headers.location, headers).then(resolve, reject);
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}: ${url}`));
                    return;
                }

                const chunks: Buffer[] = [];

                response.on('data', chunk => {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                });

                response.on('end', () => {
                    resolve(Buffer.concat(chunks).toString('utf8'));
                });
            }).on('error', reject);
        });
    }

    private cleanVersion(value: string): string {
        return value.trim().replace(/^v/i, '');
    }

    private compareVersions(a: string, b: string): number {
        const pa = a.split('.').map(part => parseInt(part, 10) || 0);
        const pb = b.split('.').map(part => parseInt(part, 10) || 0);
        const length = Math.max(pa.length, pb.length);

        for (let i = 0; i < length; i++) {
            const diff = (pa[i] || 0) - (pb[i] || 0);

            if (diff !== 0) {
                return diff;
            }
        }

        return 0;
    }
}
