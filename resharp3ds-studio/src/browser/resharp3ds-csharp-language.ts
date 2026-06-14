import { injectable } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import * as monaco from '@theia/monaco-editor-core';

@injectable()
export class ReSharp3DSCSharpLanguageContribution implements FrontendApplicationContribution {

    onStart(): void {
        this.registerLanguage();
        this.registerTokens();
        this.registerTheme();

        monaco.editor.setTheme('resharp3ds-dark');
    }

    private registerLanguage(): void {
        if (!monaco.languages.getLanguages().some(language => language.id === 'csharp')) {
            monaco.languages.register({
                id: 'csharp',
                extensions: ['.cs'],
                aliases: ['C#', 'csharp', 'cs'],
                mimetypes: ['text/x-csharp']
            });
        }

        monaco.languages.setLanguageConfiguration('csharp', {
            comments: {
                lineComment: '//',
                blockComment: ['/*', '*/']
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ]
        });
    }

    private registerTokens(): void {
        monaco.languages.setMonarchTokensProvider('csharp', {
            defaultToken: 'source',
            tokenPostfix: '.cs',

            keywords: [
                'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch',
                'char', 'checked', 'class', 'const', 'continue', 'decimal', 'default',
                'delegate', 'do', 'double', 'else', 'enum', 'event', 'explicit',
                'extern', 'false', 'finally', 'fixed', 'float', 'for', 'foreach',
                'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal',
                'is', 'lock', 'long', 'namespace', 'new', 'null', 'object',
                'operator', 'out', 'override', 'params', 'private', 'protected',
                'public', 'readonly', 'ref', 'return', 'sbyte', 'sealed', 'short',
                'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch',
                'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong',
                'unchecked', 'unsafe', 'ushort', 'using', 'virtual', 'void',
                'volatile', 'while'
            ],

            resharpTypes: [
                'Console', 'Debug', 'Input', 'Audio', 'Runtime', 'Screen',
                'Touch', 'Save', 'Time', 'Math3DS', 'Notes'
            ],

            operators: [
                '=', '>', '<', '!', '~', '?', ':',
                '==', '<=', '>=', '!=', '&&', '||', '++', '--',
                '+', '-', '*', '/', '&', '|', '^', '%',
                '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=', '=>'
            ],

            symbols: /[=><!~?:&|+\-*\/\^%]+/,

            tokenizer: {
                root: [
                    [/namespace\s+([a-zA-Z_]\w*)/, ['keyword', 'namespace.identifier']],
                    [/using\s+([a-zA-Z_]\w*)/, ['keyword', 'namespace.identifier']],

                    [/\b(class|struct|interface|enum)\s+([a-zA-Z_]\w*)/, ['keyword', 'class.identifier']],

                    [/\b([a-zA-Z_]\w*)(?=\s*\()/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@resharpTypes': 'type.identifier',
                            '@default': 'function.identifier'
                        }
                    }],

                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@resharpTypes': 'resharp.identifier',
                            '@default': 'source'
                        }
                    }],

                    [/[A-Z][\w]*/, 'class.identifier'],

                    { include: '@whitespace' },

                    [/[{}()\[\]]/, 'bracket'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'operator',
                            '@default': 'source'
                        }
                    }],

                    [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/\d+/, 'number'],

                    [/[;,.]/, 'delimiter'],

                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, 'string', '@string'],

                    [/'[^\\']'/, 'string'],
                    [/'/, 'string.invalid']
                ],

                whitespace: [
                    [/[ \t\r\n]+/, 'source'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\/\/.*$/, 'comment']
                ],

                comment: [
                    [/[^\/*]+/, 'comment'],
                    [/\/\*/, 'comment', '@push'],
                    ['\\*/', 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ],

                string: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/"/, 'string', '@pop']
                ]
            }
        });
    }

    private registerTheme(): void {
        monaco.editor.defineTheme('resharp3ds-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'source', foreground: 'E6EDF3' },

                { token: 'keyword', foreground: 'FF7B72', fontStyle: 'bold' },
                { token: 'namespace.identifier', foreground: 'FFA657' },
                { token: 'class.identifier', foreground: 'D2A8FF' },
                { token: 'type.identifier', foreground: 'D2A8FF' },
                { token: 'resharp.identifier', foreground: '79C0FF' },
                { token: 'function.identifier', foreground: 'D2A8FF' },

                { token: 'number', foreground: '79C0FF' },
                { token: 'number.float', foreground: '79C0FF' },
                { token: 'number.hex', foreground: '79C0FF' },

                { token: 'string', foreground: 'A5D6FF' },
                { token: 'string.escape', foreground: '79C0FF' },
                { token: 'string.invalid', foreground: 'FF7B72' },

                { token: 'comment', foreground: '8B949E', fontStyle: 'italic' },
                { token: 'operator', foreground: 'FF7B72' },
                { token: 'delimiter', foreground: 'E6EDF3' },
                { token: 'bracket', foreground: 'F2CC60' }
            ],
            colors: {
                'editor.background': '#1b1f24',
                'editor.foreground': '#e6edf3',
                'editorLineNumber.foreground': '#6e7681',
                'editorLineNumber.activeForeground': '#c9d1d9',
                'editorCursor.foreground': '#58a6ff',
                'editor.selectionBackground': '#264f78',
                'editor.lineHighlightBackground': '#2d333b55',
                'editorIndentGuide.background': '#30363d',
                'editorIndentGuide.activeBackground': '#8b949e',
                'editorBracketMatch.background': '#3fb95022',
                'editorBracketMatch.border': '#3fb950'
            }
        });
    }
}
