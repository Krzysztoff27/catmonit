#Requires -RunAsAdministrator
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Ensure-Admin {
    if (-not ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "powershell"
        $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
        $psi.Verb = "runas"
        $null = [System.Diagnostics.Process]::Start($psi)
        exit
    }
}

Ensure-Admin

# Globals
$selectedCAPath = ""
$serverDomain = ""
$serverPort = ""

function Show-Form {
    param (
        [string]$title,
        [System.Windows.Forms.Control[]]$controls,
        [int]$width = 400,
        [int]$height = 250
    )

    $form = New-Object System.Windows.Forms.Form
    $form.Text = $title
    $form.Size = New-Object System.Drawing.Size($width, $height)
    $form.StartPosition = "CenterScreen"
    $form.TopMost = $true

    foreach ($control in $controls) {
        $form.Controls.Add($control)
    }

    $form.ShowDialog()
}

function Show-Welcome {
    $label = New-Object System.Windows.Forms.Label
    $label.Text = "Welcome to CatMonit Telemetry Client Installation"
    $label.Size = New-Object System.Drawing.Size(380, 30)
    $label.Location = New-Object System.Drawing.Point(10, 20)

    $startBtn = New-Object System.Windows.Forms.Button
    $startBtn.Text = "Start"
    $startBtn.Size = New-Object System.Drawing.Size(100, 30)
    $startBtn.Location = New-Object System.Drawing.Point(150, 120)
    $startBtn.Add_Click({ $form.Close() })

    $global:form = Show-Form -title "CatMonit Telemetry Client Installation" -controls @($label, $startBtn)
}

function Show-CertificateSelection {
    $label = New-Object System.Windows.Forms.Label
    $label.Text = "Select CA certificate for TLS communication (.pem)"
    $label.Size = New-Object System.Drawing.Size(380, 20)
    $label.Location = New-Object System.Drawing.Point(10, 20)

    $selectBtn = New-Object System.Windows.Forms.Button
    $selectBtn.Text = "Select"
    $selectBtn.Size = New-Object System.Drawing.Size(100, 30)
    $selectBtn.Location = New-Object System.Drawing.Point(50, 60)

    $continueBtn = New-Object System.Windows.Forms.Button
    $continueBtn.Text = "Continue"
    $continueBtn.Enabled = $false
    $continueBtn.Size = New-Object System.Drawing.Size(100, 30)
    $continueBtn.Location = New-Object System.Drawing.Point(200, 60)

    $selectBtn.Add_Click({
        $fileDialog = New-Object System.Windows.Forms.OpenFileDialog
        $fileDialog.Filter = "PEM files (*.pem)|*.pem"
        if ($fileDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            $global:selectedCAPath = $fileDialog.FileName
            $continueBtn.Enabled = $true
        }
    })

    $continueBtn.Add_Click({ $form.Close() })

    $global:form = Show-Form -title "CA Certificate Selection" -controls @($label, $selectBtn, $continueBtn)
}

function Is-ValidDomain($domain) {
    return $domain -match "^(?!-)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$"
}

function Show-DomainInput {
    $label = New-Object System.Windows.Forms.Label
    $label.Text = "Enter the server domain name:"
    $label.Location = New-Object System.Drawing.Point(10, 20)
    $label.Size = New-Object System.Drawing.Size(200, 20)

    $domainBox = New-Object System.Windows.Forms.TextBox
    $domainBox.Location = New-Object System.Drawing.Point(10, 45)
    $domainBox.Size = New-Object System.Drawing.Size(360, 20)

    $portLabel = New-Object System.Windows.Forms.Label
    $portLabel.Text = "Optional: Server port"
    $portLabel.Location = New-Object System.Drawing.Point(10, 75)

    $portBox = New-Object System.Windows.Forms.TextBox
    $portBox.Location = New-Object System.Drawing.Point(10, 95)
    $portBox.Size = New-Object System.Drawing.Size(100, 20)

    $continueBtn = New-Object System.Windows.Forms.Button
    $continueBtn.Text = "Continue"
    $continueBtn.Enabled = $false
    $continueBtn.Size = New-Object System.Drawing.Size(100, 30)
    $continueBtn.Location = New-Object System.Drawing.Point(150, 130)

    $domainBox.Add_TextChanged({
        if (Is-ValidDomain $domainBox.Text) {
            $continueBtn.Enabled = $true
        } else {
            $continueBtn.Enabled = $false
        }
    })

    $continueBtn.Add_Click({
        $global:serverDomain = $domainBox.Text
        $global:serverPort = $portBox.Text
        $form.Close()
    })

    $global:form = Show-Form -title "Server Domain & Port" -controls @($label, $domainBox, $portLabel, $portBox, $continueBtn)
}

function Write-ConfigYaml {
    if (-not $global:serverPort) {
    $global:serverPort = "443"
    }
    $configPath = "$PSScriptRoot\config.yaml"
    $content = @(
        "server_address: `"$global:serverDomain`""
        "server_port: `"$global:serverPort`""
    )
    $content | Set-Content -Path $configPath -Encoding UTF8
}

function Copy-Files {
    $targetPath = "C:\Program Files\Catmonit Telemetry Client"
    if (!(Test-Path $targetPath)) {
        New-Item -ItemType Directory -Path $targetPath -Force
    }

    Copy-Item -Path $global:selectedCAPath -Destination "$targetPath\catmonit-CA.pem" -Force
    certutil -addstore -f "Root" "$global:selectedCAPath"
    Copy-Item -Path "$PSScriptRoot\*.exe" -Destination $targetPath -Force
    Copy-Item -Path "$PSScriptRoot\config.yaml" -Destination $targetPath -Force
}

function Install-Service {
    $installDir = "C:\Program Files\CatMonit Telemetry Client"
    $serviceName = "CatMonitTelemetryClient"
    $exeName = "CatMonitTelemetryClient.exe"
    $configDir = $installDir
    $serviceDescription = "Pushes telemetry data to a central server using gRPC."

    if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
        Stop-Service $serviceName -Force
        sc.exe delete $serviceName | Out-Null
        Start-Sleep -Seconds 1
    }

    New-Service `
        -Name $serviceName `
        -BinaryPathName "`"$configDir\$exeName`"" `
        -DisplayName $serviceName `
        -StartupType Manual `
        -Description $serviceDescription
    }

function Show-Finish {
    $label = New-Object System.Windows.Forms.Label
    $label.Text = "Installation complete."
    $label.Location = New-Object System.Drawing.Point(10, 20)
    $label.Size = New-Object System.Drawing.Size(300, 20)

    $finishBtn = New-Object System.Windows.Forms.Button
    $finishBtn.Text = "Finish"
    $finishBtn.Size = New-Object System.Drawing.Size(100, 30)
    $finishBtn.Location = New-Object System.Drawing.Point(150, 100)
    $finishBtn.Add_Click({ $form.Close() })

    $global:form = Show-Form -title "Installation Complete" -controls @($label, $finishBtn)
}

# === Main Flow ===
Show-Welcome
Show-CertificateSelection
Show-DomainInput
Write-ConfigYaml
Copy-Files
Install-Service
Show-Finish
