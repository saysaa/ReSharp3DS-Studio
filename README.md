# ReSharp3DS Studio

**ReSharp3DS Studio** is a dedicated desktop IDE for building C# applications for the **ReSharp3DS Nintendo 3DS runtime**.

It is built with **Theia + Electron** and provides a focused workflow:

```txt
Open project folder
Run ReSharp3DS: Build PE
Get dist/<ProjectName>.pe
Copy the .pe file to the 3DS SD card
```

ReSharp3DS Studio is not a generic VS Code extension. It is a standalone desktop application focused on ReSharp3DS development.

---

## Links

- [ReSharp3DS Runtime](https://github.com/saysaa/ReSharp3DS)
- [ReSharp3DS Documentation](https://github.com/saysaa/ReSharp3DS/tree/docs)
- [ReSharp3DS SDK](https://github.com/saysaa/ReSharp3DS/tree/sdk)

---

## What is ReSharp3DS?

ReSharp3DS is an experimental Nintendo 3DS homebrew runtime that runs managed C# code using nanoCLR / .NET nanoFramework.

The native 3DS runtime loads `.pe` applications from the SD card and exposes 3DS features to C# through the `ReSharp3DS.cs` SDK API.

ReSharp3DS Studio is the desktop tool used to write and build those C# applications.

---

## Features

```txt
Dedicated ReSharp3DS IDE
Theia / Electron desktop app
C# syntax highlighting
Build PE command
Automatic ReSharp3DS.cs SDK download before build
GitHub update check
Linux and Windows packaging support
```

Current IDE commands:

```txt
ReSharp3DS: Build PE
ReSharp3DS: Check for Updates
```

---

## Build workflow

A ReSharp3DS Studio project is a normal folder containing your C# source files.

Minimal project:

```txt
MyApp/
  Program.cs
```

When you run:

```txt
ReSharp3DS: Build PE
```

the IDE will:

```txt
1. Download the latest ReSharp3DS.cs SDK file
2. Place it in the opened project folder
3. Compile the C# project using nanoFramework.CoreLibrary 1.9.0-preview.11
4. Run nanoFramework MetadataProcessor
5. Generate dist/<ProjectName>.pe
```

Example output:

```txt
MyApp/
  Program.cs
  ReSharp3DS.cs
  dist/
    MyApp.pe
```

---

## nanoFramework version

ReSharp3DS Studio currently targets:

```txt
nanoFramework.CoreLibrary 1.9.0-preview.11
MetadataProcessor CLI 3.0.100
```

The generated `.pe` must match the `mscorlib.pe` used by the ReSharp3DS runtime.

Do not update nanoFramework packages randomly unless the runtime `mscorlib.pe` is updated too.

A version mismatch can cause runtime errors such as:

```txt
ResolveAll errors
PrepareForExecution errors
missing methods
native calls not working
runtime crashes
```

---

## Requirements

To build and run ReSharp3DS Studio from source:

```txt
Node.js 18+
Yarn 1.x
Git
.NET SDK
```

On Linux, building ReSharp3DS `.pe` applications also requires:

```txt
Mono
```

Example Linux setup:

```bash
sudo apt update
sudo apt install git nodejs npm mono-complete
npm install --global yarn
```

Check your tools:

```bash
node --version
yarn --version
dotnet --info
mono --version
```

---

## Running from source

```bash
git clone https://github.com/saysaa/ReSharp3DS-Studio.git
cd ReSharp3DS-Studio
yarn install
yarn build:electron
yarn start:electron
```

---

## Development commands

Start the browser version:

```bash
yarn build:browser
yarn start:browser
```

Start the Electron desktop version:

```bash
yarn build:electron
yarn start:electron
```

Rebuild the internal ReSharp3DS Studio module:

```bash
cd resharp3ds-studio
npm run clean
npm run build
cd ..
```

Run the internal compiler directly:

```bash
dotnet run --project resharp3ds-studio/compiler/ReSharp3DS.Compiler -- \
  --project ~/Desktop/TestApp \
  --output TestApp.pe
```

---

## Packaging

Directory build:

```bash
yarn dist:dir
```

Linux packages:

```bash
yarn dist:linux
```

Windows packages:

```bash
yarn dist:win
```

Packaging output is written to:

```txt
electron-app/dist/
```

---

## Creating a ReSharp3DS app

Create a folder and add `Program.cs`:

```csharp
using ReSharp3DS;
using Console = ReSharp3DS.Console;

public class Program
{
    static bool initialized = false;

    public static void Main()
    {
        if (!initialized)
        {
            initialized = true;

            Console.Clear();
            Console.WriteLine("Hello ReSharp3DS Studio!");
        }

        Runtime.Yield();
    }
}
```

Open the folder in ReSharp3DS Studio and run:

```txt
ReSharp3DS: Build PE
```

The IDE will generate:

```txt
dist/<ProjectName>.pe
```

---

## Running on Nintendo 3DS

Copy the generated `.pe` file to the SD card.

Recommended runtime layout:

```txt
sdmc:/3ds/ReSharp3DS.3dsx
sdmc:/ReSharp3DS/bin/mscorlib.pe
sdmc:/ReSharp3DS/MyApp/MyApp.pe
```

The ReSharp3DS runtime launcher scans:

```txt
sdmc:/ReSharp3DS/
```

It can display folders and launch `.pe` files from subfolders.

---

## ReSharp3DS API

The SDK API is provided by `ReSharp3DS.cs`.

ReSharp3DS Studio downloads this file automatically before building a project.

Available API areas include:

```txt
Console API
Input API
Runtime API
Time API
Random API
Touch API
CirclePad API
Screen constants
App API
SystemInfo API
Graphics API
Audio API
File API
Directory API
Save API
```

---

## Runtime execution model

ReSharp3DS uses a tick-based runtime model.

`Program.Main()` can be called repeatedly while the application is running.

Use static fields to keep state and avoid clearing the screen every tick.

---

## Update system

ReSharp3DS Studio includes a GitHub update check command:

```txt
ReSharp3DS: Check for Updates
```

It checks the latest GitHub release and compares it with the local app version.

Future versions may support automatic download, install, and restart.

---

## Documentation

More documentation is available in:

```txt
docs/BUILDING.md
docs/PACKAGING.md
docs/RELEASES.md
docs/UPDATE_SYSTEM.md
docs/TROUBLESHOOTING.md
docs/PROJECT_STRUCTURE.md
```

---

## Notes

ReSharp3DS Studio is experimental.

The project is still evolving, and APIs may change before a stable release.
