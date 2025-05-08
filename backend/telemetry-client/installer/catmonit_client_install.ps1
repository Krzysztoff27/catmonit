###############################
#   Admin priviliges check
###############################
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
    [Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "To install the Catmonit Client you must run this script as an Administrator!"
    exit 1
}

###############################
#         File Paths
###############################
$serviceName = "CatmonitClient"
$exePath = Join-Path $PSScriptRoot "CatmonitClient.exe" #CHANGE THE DIRECTORY RELATIVE PATH AFTER DIRECTORIES CLEANUP
$certPath = Join-Path $PSScriptRoot "config\certs\server.crt"
$certName = "gRPC-Telemetry-Root" #CHANGE CERT NAME

###############################
#        Installation
###############################
# Check agent binary exists
if (!(Test-Path $exePath)) {
    Write-Error "CatmonitClient.exe not found!"
    exit 1
}

# Importing CatmonitServer certificate to client Windows Certificate Store
if (Test-Path $certPath) {
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
    $cert.Import($certPath)

    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store "Root", "LocalMachine"
    $store.Open("ReadWrite")

    if (-not $store.Certificates.Find("FindByThumbprint", $cert.Thumbprint, $false)) {
        Write-Host "Importing certificate into Trusted Root Certificates store."
        $store.Add($cert)
    } else {
        Write-Host "Certificate already exists in store."
    }

    $store.Close()
} else {
    Write-Error "No server certificate (CatmonitServer.crt) found!"
    exit 1
}

# Register CatmonitClient as a Windows service
Write-Host "Installing $serviceName service..."

if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
    Write-Host "Service already exists. Restarting..."
    Restart-Service -Name $serviceName
} else {
    New-Service -Name $serviceName -BinaryPathName "`"$exePath`"" -DisplayName "$serviceName" -StartupType Automatic
    Start-Service -Name $serviceName
}

Write-Host "CatMonit client was installed succesfully!"
