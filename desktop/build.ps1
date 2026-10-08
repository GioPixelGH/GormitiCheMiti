# ============================================================
#  build.ps1 : crea l'app desktop per Windows in dist\Gormiti\
#  Uso:  powershell -ExecutionPolicy Bypass -File desktop\build.ps1
#  Requisiti: Windows 10/11 (usa il compilatore C# incluso in .NET
#  Framework 4.x). Scarica una sola volta il pacchetto NuGet
#  Microsoft.Web.WebView2 nella cartella desktop\.cache\.
# ============================================================
$ErrorActionPreference = 'Stop'
$WebView2Version = '1.0.2903.40'

$root = Split-Path -Parent $PSScriptRoot
$desk = $PSScriptRoot
$cache = Join-Path $desk '.cache'
$out = Join-Path $root 'dist\Gormiti'

# --- compilatore C# di .NET Framework
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) { $csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe' }
if (-not (Test-Path $csc)) { throw 'csc.exe non trovato: serve .NET Framework 4.x' }

# --- pacchetto WebView2 (solo la prima volta)
$pkg = Join-Path $cache "webview2-$WebView2Version"
if (-not (Test-Path (Join-Path $pkg 'lib'))) {
    New-Item -ItemType Directory -Force $cache | Out-Null
    $zip = Join-Path $cache "webview2-$WebView2Version.zip"
    Write-Host "Scarico Microsoft.Web.WebView2 $WebView2Version da nuget.org..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -UseBasicParsing "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/$WebView2Version" -OutFile $zip
    Expand-Archive -Force $zip $pkg
    Remove-Item $zip
}
$lib = Join-Path $pkg 'lib\net462'
if (-not (Test-Path $lib)) { $lib = Join-Path $pkg 'lib\net45' }
$native = Join-Path $pkg 'runtimes\win-x64\native\WebView2Loader.dll'

# --- cartella di uscita pulita
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory -Force $out | Out-Null

# --- compilazione
$fx = Split-Path -Parent $csc
& $csc /nologo /target:winexe /platform:x64 /optimize+ `
    "/out:$out\Gormiti.exe" `
    "/win32icon:$root\assets\icons\gormiti.ico" `
    "/win32manifest:$desk\app.manifest" `
    "/r:$lib\Microsoft.Web.WebView2.Core.dll" `
    "/r:$lib\Microsoft.Web.WebView2.WinForms.dll" `
    "/r:$fx\System.Windows.Forms.dll" `
    "/r:$fx\System.Drawing.dll" `
    "$desk\GormitiLauncher.cs"
if ($LASTEXITCODE -ne 0) { throw 'Compilazione fallita' }

Copy-Item "$lib\Microsoft.Web.WebView2.Core.dll", "$lib\Microsoft.Web.WebView2.WinForms.dll", $native $out

# --- file del gioco
$game = Join-Path $out 'game'
New-Item -ItemType Directory -Force $game | Out-Null
Copy-Item (Join-Path $root 'index.html'), (Join-Path $root 'manifest.webmanifest'), (Join-Path $root 'sw.js') $game
foreach ($d in 'css', 'js', 'assets') { Copy-Item -Recurse (Join-Path $root $d) (Join-Path $game $d) }
Copy-Item (Join-Path $root 'README.md') $out

# --- archivio zip pronto da condividere
$zipOut = Join-Path $root 'dist\Gormiti-Windows.zip'
if (Test-Path $zipOut) { Remove-Item $zipOut }
Compress-Archive -Path $out -DestinationPath $zipOut
Write-Host ''
Write-Host "Fatto: $out\Gormiti.exe"
Write-Host "Archivio: $zipOut"
