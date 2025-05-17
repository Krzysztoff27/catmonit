fileshares_extract_script = """
    # Get all non-special shares (exclude administrative shares)
    $shares = Get-SmbShare | Where-Object { 
        $_.Path -ne $null -and 
        $_.Name -notmatch '\\$$' -and 
        $_.ShareType -eq 'FileSystemDirectory'
    }

    $result = @()

    foreach ($share in $shares) {
        $path = $share.Path
        $drive = $path.Substring(0, 2)

        $disk = Get-Volume -DriveLetter $drive[0] -ErrorAction SilentlyContinue
        if ($disk) {
            $result += [PSCustomObject]@{
                share_path = $path
                usage = $disk.Size - $disk.SizeRemaining
                capacity = $disk.Size
            }
        }
    }
    $result | ConvertTo-Json -Depth 3
"""

disk_errors_script = """
$vols = Get-Volume | Where-Object DriveLetter | Select-Object DriveLetter, ObjectId
$events = Get-WinEvent -FilterHashtable @{
    LogName = 'System'
    ProviderName = 'disk'
    Level = 2,3
    StartTime = (Get-Date).AddDays(-1)
} -MaxEvents 30

$result = @()

foreach ($e in $events) {
    $msg = $e.Message
    $mount = ''

    foreach ($v in $vols) {
        if ($msg -like "*$($v.DriveLetter):*") {
            $mount = "$($v.DriveLetter):"
            break
        }
    }

    $result += [PSCustomObject]@{
        message = $msg
        source = $e.ProviderName
        timestamp = [int64]([DateTimeOffset]$e.TimeCreated).ToUnixTimeSeconds()
        mount_point = $mount
    }
}
$result | ConvertTo-Json -Depth 3
"""

system_errors_script = """
$events = Get-WinEvent -FilterHashtable @{
    LogName = 'System'
    Level = 1,2
    StartTime = (Get-Date).AddDays(-1)
} -MaxEvents 30

$result = @()

foreach ($e in $events) {
    $result += [PSCustomObject]@{
        message = $e.Message
        source = $e.ProviderName
        timestamp = [int64]([DateTimeOffset]$e.TimeCreated).ToUnixTimeSeconds()
    }
}
$result | ConvertTo-Json -Depth 3
"""
