import { injectable } from '@theia/core/shared/inversify';
import { fileURLToPath } from 'url';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import {
    ReSharp3DSBuildRequest,
    ReSharp3DSBuildResult,
    ReSharp3DSBuildService
} from '../common/resharp3ds-build-protocol';

const ReSharp3DSCsUrl = 'https://raw.githubusercontent.com/saysaa/ReSharp3DS/35cf6cf50ca7f44e8024c0fe63a22b34a38937aa/ReSharp3DS.cs';

@injectable()
export class ReSharp3DSBuildServiceImpl implements ReSharp3DSBuildService {

    async build(request: ReSharp3DSBuildRequest): Promise<ReSharp3DSBuildResult> {
        const projectPath = fileURLToPath(request.projectUri);
        const compilerProject = this.findCompilerProject();

        const sdkLog = await this.ensureReSharp3DSSdk(projectPath);

        const args = [
            'run',
            '--project',
            compilerProject,
            '--',
            '--project',
            projectPath,
            '--output',
            request.outputName
        ];

        const result = await this.runProcess('dotnet', args, projectPath);
        const log = `${sdkLog}\n${result.log}`;

        return {
            success: result.exitCode === 0,
            message: result.exitCode === 0 ? 'Build completed.' : 'Build failed.',
            log
        };
    }

    private async ensureReSharp3DSSdk(projectPath: string): Promise<string> {
        const target = path.join(projectPath, 'ReSharp3DS.cs');
        const source = await this.downloadText(ReSharp3DSCsUrl);

        fs.writeFileSync(target, source, 'utf8');

        return [
            'SDK updated.',
            `Source: ${ReSharp3DSCsUrl}`,
            `Target: ${target}`,
            ''
        ].join('\n');
    }

    private downloadText(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            https.get(url, response => {
                if (
                    response.statusCode &&
                    response.statusCode >= 300 &&
                    response.statusCode < 400 &&
                    response.headers.location
                ) {
                    this.downloadText(response.headers.location).then(resolve, reject);
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Download failed: HTTP ${response.statusCode} ${url}`));
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

    private findCompilerProject(): string {
        const candidates = [
            ...(process.resourcesPath ? [
                path.resolve(
                    process.resourcesPath,
                    'resharp3ds-studio',
                    'compiler',
                    'ReSharp3DS.Compiler',
                    'ReSharp3DS.Compiler.csproj'
                )
            ] : []),

            path.resolve(
                process.cwd(),
                '..',
                'resharp3ds-studio',
                'compiler',
                'ReSharp3DS.Compiler',
                'ReSharp3DS.Compiler.csproj'
            ),
            path.resolve(
                process.cwd(),
                'resharp3ds-studio',
                'compiler',
                'ReSharp3DS.Compiler',
                'ReSharp3DS.Compiler.csproj'
            ),
            path.resolve(
                __dirname,
                '..',
                '..',
                'compiler',
                'ReSharp3DS.Compiler',
                'ReSharp3DS.Compiler.csproj'
            ),
            path.resolve(
                __dirname,
                '..',
                '..',
                '..',
                'resharp3ds-studio',
                'compiler',
                'ReSharp3DS.Compiler',
                'ReSharp3DS.Compiler.csproj'
            )
        ];

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }

        throw new Error(`Compiler project not found. Checked:\n${candidates.join('\n')}`);
    }

    private runProcess(command: string, args: string[], cwd: string): Promise<{ exitCode: number; log: string }> {
        return new Promise(resolve => {
            const lines: string[] = [];

            lines.push(`$ ${command} ${args.map(arg => this.quoteForLog(arg)).join(' ')}`);
            lines.push('\n');

            const child = childProcess.spawn(command, args, {
                cwd,
                shell: false,
                windowsHide: true
            });

            child.stdout.on('data', data => {
                lines.push(data.toString());
            });

            child.stderr.on('data', data => {
                lines.push(data.toString());
            });

            child.on('error', error => {
                lines.push(`Process error: ${error.message}\n`);
                resolve({
                    exitCode: 1,
                    log: lines.join('')
                });
            });

            child.on('close', code => {
                lines.push('\n');
                lines.push(`Exit code: ${code ?? 1}\n`);

                resolve({
                    exitCode: code ?? 1,
                    log: lines.join('')
                });
            });
        });
    }

    private quoteForLog(value: string): string {
        return value.includes(' ') ? `"${value.replace(/"/g, '\\"')}"` : value;
    }
}
