Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Background dark rounded rect / gradient
$rect = New-Object System.Drawing.Rectangle 0, 0, 256, 256
$brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(255, 10, 14, 23)), ([System.Drawing.Color]::FromArgb(255, 15, 23, 42)), 45.0
$g.FillRectangle($brushBg, $rect)

# Outer neon glow circle
$penGlow = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 56, 189, 248)), 6.0
$g.DrawEllipse($penGlow, 18, 18, 220, 220)

# Inner accent circle
$penInner = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(50, 99, 102, 241)), 2.0
$g.DrawEllipse($penInner, 30, 30, 196, 196)

# Equalizer bars
$barColors = @(
    [System.Drawing.Color]::FromArgb(255, 56, 189, 248),
    [System.Drawing.Color]::FromArgb(255, 99, 102, 241),
    [System.Drawing.Color]::FromArgb(255, 168, 85, 247),
    [System.Drawing.Color]::FromArgb(255, 236, 72, 153),
    [System.Drawing.Color]::FromArgb(255, 56, 189, 248)
)

$barHeights = @(35, 60, 95, 130, 85, 110, 145, 90, 65, 40)
for ($i = 0; $i -lt $barHeights.Length; $i++) {
    $bx = 48 + $i * 16
    $bh = $barHeights[$i]
    $by = 110 - ($bh / 2)
    $color = $barColors[$i % $barColors.Length]
    $brushBar = New-Object System.Drawing.SolidBrush $color
    $g.FillRectangle($brushBar, $bx, [int]$by, 10, [int]$bh)
}

# Draw D2 Text overlay
$fontMain = [System.Drawing.Font]::new("Segoe UI", [float]34, [System.Drawing.FontStyle]::Bold)
$fontSub = [System.Drawing.Font]::new("Segoe UI", [float]11, [System.Drawing.FontStyle]::Bold)
$brushText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$brushSub = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 56, 189, 248))

$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

$g.DrawString("D2", $fontMain, $brushText, 128.0, 188.0, $format)
$g.DrawString("VISUALIZER", $fontSub, $brushSub, 128.0, 218.0, $format)

$pngPath = 'resources\icon.png'
$icoPath = 'resources\icon.ico'
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Convert to icon
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream $icoPath, ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

Write-Host "Icons generated successfully at $pngPath and $icoPath"
