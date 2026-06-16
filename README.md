# ReSharp3DS Studio

**ReSharp3DS Studio** is a dedicated desktop IDE for building C# applications for the **ReSharp3DS Runtime**.

```txt
Open a ReSharp3DS project folder
Run ReSharp3DS: Build PE
Get dist/<ProjectName>.pe
Copy the .pe file to the 3DS SD card
```

---

## Links

* [ReSharp3DS Runtime](https://github.com/saysaa/ReSharp3DS)
* [ReSharp3DS Documentation](https://github.com/saysaa/ReSharp3DS/tree/docs)
* [ReSharp3DS SDK](https://github.com/saysaa/ReSharp3DS/tree/sdk)

---

## Features

```txt
Dedicated ReSharp3DS IDE
Standalone Theia / Electron desktop app
C# syntax highlighting
Build PE command
Automatic ReSharp3DS.cs SDK download before build
GitHub update check
Unpacked Linux and Windows builds
```

Current IDE commands:

```txt
ReSharp3DS: Build PE
ReSharp3DS: Check for Updates
```

---

## Installation

ReSharp3DS Studio is currently distributed as an **unpacked application archive**.

There is currently no official `.deb`, `.rpm`, AppImage, or Windows installer.

---

### Linux installation

Download:

````or Windows installer.

---

### Linux installation

Download:

```txt
ReSharp3DS-Studio-linux-x64.zip
````

Extract it:

```bash
unzip ReSharp3DS-Studio-linux-x64.zip
cd linux-unpacked
```

Run ReSharp3DS Studio:

```bash
./resharp3ds-studio
```

---

### Linux requirements

ReSharp3DS Studio requires:

```txt
.NET SDK
Mono
```

Fedora:

```bash
sudo dnf install mono-complete
dotnet --list-sdks
mono --version
```

Ubuntu / Debian:

```bash
sudo apt update
sudo apt install mono-complete
dotnet --list-sdks
mono --version
```

If `dotnet --list-sdks` shows no SDK, install the .NET SDK from your distribution packages or from Microsoft’s official .NET downloads.

---

### Optional Linux desktop shortcut

After extracting `ReSharp3DS-Studio-linux-x64.zip`, you can install it manually to `/opt`:

```bash
sudo rm -rf /opt/ReSharp3DS-Studio
sudo mkdir -p /opt/ReSharp3DS-Studio
sudo cp -a linux-unpacked/. /opt/ReSharp3DS-Studio/
```

Create a launcher command:

```bash
sudo ln -sf /opt/ReSharp3DS-Studio/resharp3ds-studio /usr/local/bin/resharp3ds-studio
```

Create a desktop entry:

```bash
sudo tee /usr/share/applications/resharp3ds-studio.desktop > /dev/null <<'EOF'
[Desktop Entry]
Name=ReSharp3DS Studio
Comment=IDE for ReSharp3DS development
Exec=/opt/ReSharp3DS-Studio/resharp3ds-studio
Terminal=false
Type=Application
Categories=Development;IDE;
EOF
```

Then launch it from the terminal with:

```bash
resharp3ds-studio
```

---

### Windows installation

Download:

```txt
ReSharp3DS-Studio-windows-x64.zip
```

Extract it and run:

```txt
win-unpacked/ReSharp3DS Studio.exe
```

Windows requirements:

```txt
.NET SDK
```

Mono is not required on Windows.

---

## Creating a ReSharp3DS app

Create a folder containing `Program.cs`:

```txt
MyApp/
  Program.cs
```

Example `Program.cs`:

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

Open the folder in ReSharp3DS Studio:

```txt
File
Open Folder
Select MyApp/
```

Then run:

```txt
ReSharp3DS: Build PE
```

The IDE will generate:

```txt
MyApp/
  Program.cs
  ReSharp3DS.cs
  dist/
    MyApp.pe
```

---

## Build workflow

When you run:

```txt
ReSharp3DS: Build PE
```

the IDE will:

```txt
1. Download ReSharp3DS.cs
2. Place it in the opened project folder
3. Compile the C# source files
4. Run nanoFramework MetadataProcessor
5. Generate dist/<ProjectName>.pe
```

The opened folder should directly contain your project source files.

Recommended structure:

```txt
MyApp/
  Program.cs
```

Avoid opening a parent folder containing multiple apps unless you know what you are doing.

---

## nanoFramework version

ReSharp3DS Studio currently targets:

```txt
nanoFramework.CoreLibrary 1.9.0-preview.11
MetadataProcessor CLI 3.0.100
```

The generated `.pe` must match the `mscorlib.pe` used by the ReSharp3DS runtime.

Do not update nanoFramework packages randomly unless the runtime `mscorlib.pe` is updated too.

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

The SDK API is provided by:

```txt
ReSharp3DS.cs
```

ReSharp3DS Studio downloads this file automatically before building a project.

---

## Building ReSharp3DS Studio from source

Requirements:

```txt
Git
Node.js 22 LTS
Yarn 1.x
.NET SDK
```

Linux also requires:

```txt
Mono
```

Clone the repository:

```bash
git clone https://github.com/saysaa/ReSharp3DS-Studio.git
cd ReSharp3DS-Studio
```

Install dependencies:

```bash
yarn install
```

Build and start the Electron version:

```bash
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

Rebuild the internal ReSharp3DS Studio extension:

```bash
cd resharp3ds-studio
npm run clean
npm run build
cd ..
```

Run the internal compiler directly:

```bash
dotnet run --project resharp3ds-studio/compiler/ReSharp3DS.Compiler -- \
  --project ~/Desktop/MyApp \
  --output MyApp.pe
```

---

## Creating unpacked builds

Create an unpacked desktop build:

```bash
yarn dist:dir
```

The output is written to:

```txt
electron-app/dist/
```

Linux output:

```txt
electron-app/dist/linux-unpacked/
```

Windows output:

```txt
electron-app/dist/win-unpacked/
```

---

## Creating release archives

Linux:

```bash
cd electron-app/dist
zip -r ReSharp3DS-Studio-linux-x64.zip linux-unpacked
```

Windows PowerShell:

```powershell
Compress-Archive -Path .\electron-app\dist\win-unpacked -DestinationPath .\ReSharp3DS-Studio-windows-x64.zip
```

Upload the generated `.zip` files to GitHub Releases.

---

## Update system

ReSharp3DS Studio includes a GitHub update check command:

```txt
ReSharp3DS: Check for Updates
```

It checks the latest GitHub release and compares it with the local app version.

The update check does not currently install updates automatically.

---

## Troubleshooting

### Build failed: Roslyn csc.dll not found

Install the .NET SDK and check that it is visible:

```bash
dotnet --list-sdks
```

On Fedora, the .NET SDK is often installed under:

```txt
/usr/lib64/dotnet
```

### Build failed: mono not found

Install Mono.

Fedora:

```bash
sudo dnf install mono-complete
```

Ubuntu / Debian:

```bash
sudo apt install mono-complete
```

Check:

```bash
mono --version
```

### No .pe file is generated

Make sure you opened the folder that directly contains your `Program.cs`.

Good:

```txt
MyApp/
  Program.cs
```

Bad:

```txt
Projects/
  MyApp/
    Program.cs
  AnotherApp/
    Program.cs
```

Open `MyApp/`, not `Projects/`.

---

## Documentation

More documentation may be added in:

```txt
docs/BUILDING.md
docs/PACKAGING.md
docs/RELEASES.md
docs/UPDATE_SYSTEM.md
docs/TROUBLESHOOTING.md
docs/PROJECT_STRUCTURE.md
```

---

## License

ReSharp3DS Studio is licensed under the GNU General Public License v3.0.

```txt
GPL-3.0-only
```

---

## Notes

ReSharp3DS Studio is experimental.

The project is still evolving, and APIs may change before a stable release.
