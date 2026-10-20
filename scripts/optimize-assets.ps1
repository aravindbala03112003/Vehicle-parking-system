Add-Type -AssemblyName System.Drawing

function Optimize-ImageFile($filePath, $maxDim, $quality) {
    if (-not (Test-Path $filePath)) { return }
    $origBytes = (Get-Item $filePath).Length
    $raw = [System.IO.File]::ReadAllBytes($filePath)
    $ms = New-Object System.IO.MemoryStream(,$raw)
    $img = [System.Drawing.Image]::FromStream($ms)

    $w = $img.Width
    $h = $img.Height
    $scale = 1.0
    if ($w -gt $maxDim -or $h -gt $maxDim) {
        if ($w -gt $h) {
            $scale = $maxDim / $w
        } else {
            $scale = $maxDim / $h
        }
    }
    $newW = [int]($w * $scale)
    $newH = [int]($h * $scale)

    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $newW, $newH)

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

    $outStream = New-Object System.IO.MemoryStream
    $bmp.Save($outStream, $codec, $encoderParams)
    $newBytes = $outStream.ToArray()

    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
    $ms.Dispose()
    $outStream.Dispose()

    if ($newBytes.Length -lt $origBytes) {
        [System.IO.File]::WriteAllBytes($filePath, $newBytes)
        $ratio = [math]::Round(($origBytes - $newBytes.Length) / $origBytes * 100, 1)
        Write-Output "Optimized: $filePath ($origBytes -> $($newBytes.Length) bytes, reduced $ratio%)"
    } else {
        Write-Output "Kept original: $filePath (new was larger or equal)"
    }
}

$targets = @(
    "vehicle-parking/parking1.jpg",
    "vehicle-parking/parking2.jpg",
    "vehicle-parking/parking3.jpg",
    "vehicle-parking/parking4.jpg",
    "vehicle-parking/parking5.jpg",
    "vehicle-parking/images/parking1.jpg",
    "vehicle-parking/images/parking2.jpg",
    "vehicle-parking/images/parking3.jpg",
    "vehicle-parking/images/parking4.jpg",
    "vehicle-parking/images/parking5.jpg",
    "vehicle-parking/project images/home4.jpg"
)

foreach ($t in $targets) {
    Optimize-ImageFile $t 1280 80
}
