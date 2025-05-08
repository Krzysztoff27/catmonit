#First 8 characters of GUID serve as an identifier for the client machines 
$vm_guid = (New-Guid).ToString()[0..7] -join ''

#Root directory of the whole Hyper-V testing setup
$project_directory = "D:\virtuaalikoneet\kolchr"

$vm_name = "kolchr WS2025-$vm_guid"
$vm_directory = "$project_directory\$vm_name\Virtual Machines"

$disk_directory = "$project_directory\$vm_name\Virtual Hard Disks"
$disk_name = "WS2025-$vm_guid.vhdx"
$disk = "$disk_directory\$disk_name"

$iso_directory = "\\files\install\os\Microsoft Windows Server\WIndows Server 2025"
$iso_name = "en-us_windows_server_2025_x64_dvd_b7ec10f3.iso"
$iso = "$iso_directory\$iso_name"

$floppy_directory = "$project_directory\unattend-installation"
$floppy = "$floppy_directory\WS2025.vfd"

<#Write-Output $vm_directory '\n'
Write-Output $disk '\n'
Write-Output $iso '\n'
Write-Output $floppy "\n"#>

#Write-Output $floppy.TrimEnd('.vfd')

New-VM -Name "$vm_name" `
        -MemoryStartupBytes 4GB `
        -Generation 2 `
        -Path "$vm_directory" `
        -NewVHDPath "$disk" `
        -NewVHDSizeBytes 30GB

Set-VMDvdDrive -VMName "$vm_name" -Path "$iso"

#Virtual floppy holding unattend.xml file for automated vm setup
New-VFD -Path "$floppy"
Copy-Item "unattend.xml" -Destination "$floppy"

Set-VMFloppyDiskDrive -VMName "$vm_name" -Path "$floppy"

Set-VMFirmware -VMName "$vm_name" -EnableSecureBoot On
Set-VMProcessor -VMName "$vm_name" -Count 2
Set-VMNetworkAdapter -VMName "$vm_name" -StaticMacAddress "00155D010100"

Start-VM -Name "$vm_name"



