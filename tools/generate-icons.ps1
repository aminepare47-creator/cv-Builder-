#requires -Version 5.1
<#
  CV Builder Pro - generation des icones PWA et de l'image de partage.

  Le logo est dessine ici avec GDI+ en reprenant exactement la geometrie de
  public/logo.svg (espace 512 x 512), afin que les PNG et le SVG soient
  identiques.

  Usage : npm run icons
          powershell -ExecutionPolicy Bypass -File tools/generate-icons.ps1

  Remarque : ce fichier est volontairement sans accent ni caractere special
  (les rares caracteres accentues sont produits via [char], PowerShell 5.1
  lisant les scripts sans BOM en ANSI).
#>

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $Root 'public'
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

# -- Charset ------------------------------------------------------
$eAcute = [string][char]0x00E9   # e accent aigu
$middot = [string][char]0x00B7   # point median

# -- Palette ------------------------------------------------------
$Indigo = [System.Drawing.ColorTranslator]::FromHtml('#6366f1')
$Purple = [System.Drawing.ColorTranslator]::FromHtml('#8b5cf6')
$Pink = [System.Drawing.ColorTranslator]::FromHtml('#ec4899')
$White = [System.Drawing.Color]::White
$SoftWhite = [System.Drawing.Color]::FromArgb(232, 255, 255, 255)
$DarkerWhite = [System.Drawing.Color]::FromArgb(140, 255, 255, 255)
$Slate300 = [System.Drawing.ColorTranslator]::FromHtml('#cbd5e1')
$Slate200 = [System.Drawing.ColorTranslator]::FromHtml('#e2e8f0')

# -- Geometrie du logo (identique a public/logo.svg) --------------
$Page = @{ X = 132; Y = 100; W = 240; H = 272; R = 30 }
$Bars = @(
  @{ X = 172; Y = 169; W = 108; H = 30; R = 15; C = $Indigo },
  @{ X = 172; Y = 221; W = 160; H = 18; R = 9; C = $Slate300 },
  @{ X = 172; Y = 255; W = 120; H = 18; R = 9; C = $Slate300 },
  @{ X = 172; Y = 289; W = 160; H = 18; R = 9; C = $Slate200 }
)
$Spark = @{ CX = 416; CY = 416; R = 48 }

# -- Helpers de dessin --------------------------------------------
function New-RoundedRectPath {
  param([single]$X, [single]$Y, [single]$W, [single]$H, [single]$R)
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  if ($R -le 0) {
    $path.AddRectangle([System.Drawing.RectangleF]::new($X, $Y, $W, $H))
    return $path
  }
  $d = $R * 2
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

# Courbe quadratique (absente de GDI+) convertie en courbe de Bezier.
function Add-QuadCurve {
  param([System.Drawing.Drawing2D.GraphicsPath]$Path, [System.Drawing.PointF]$P0, [System.Drawing.PointF]$C, [System.Drawing.PointF]$P1)
  $f = [single](2.0 / 3.0)
  $c1 = [System.Drawing.PointF]::new($P0.X + $f * ($C.X - $P0.X), $P0.Y + $f * ($C.Y - $P0.Y))
  $c2 = [System.Drawing.PointF]::new($P1.X + $f * ($C.X - $P1.X), $P1.Y + $f * ($C.Y - $P1.Y))
  $Path.AddBezier($P0, $c1, $c2, $P1)
}

function New-BrandBrush {
  param([single]$W, [single]$H)
  $rect = [System.Drawing.RectangleF]::new(0, 0, $W, $H)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $Indigo, $Pink, [single]45)
  $blend = [System.Drawing.Drawing2D.ColorBlend]::new(3)
  $blend.Colors = @($Indigo, $Purple, $Pink)
  $blend.Positions = @([single]0, [single]0.5, [single]1)
  $brush.InterpolationColors = $blend
  return $brush
}

# Dessine la feuille de CV + l'eclat (espace 512 x 512).
function Draw-BrandGlyph {
  param([System.Drawing.Graphics]$Graphics)
  $whiteBrush = [System.Drawing.SolidBrush]::new($White)

  $pagePath = New-RoundedRectPath -X $Page.X -Y $Page.Y -W $Page.W -H $Page.H -R $Page.R
  $Graphics.FillPath($whiteBrush, $pagePath)
  $pagePath.Dispose()

  foreach ($bar in $Bars) {
    $p = New-RoundedRectPath -X $bar.X -Y $bar.Y -W $bar.W -H $bar.H -R $bar.R
    $b = [System.Drawing.SolidBrush]::new($bar.C)
    $Graphics.FillPath($b, $p)
    $b.Dispose()
    $p.Dispose()
  }

  $top = [System.Drawing.PointF]::new($Spark.CX, $Spark.CY - $Spark.R)
  $right = [System.Drawing.PointF]::new($Spark.CX + $Spark.R, $Spark.CY)
  $bottom = [System.Drawing.PointF]::new($Spark.CX, $Spark.CY + $Spark.R)
  $left = [System.Drawing.PointF]::new($Spark.CX - $Spark.R, $Spark.CY)
  $center = [System.Drawing.PointF]::new($Spark.CX, $Spark.CY)

  $sparkPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $sparkPath.StartFigure()
  Add-QuadCurve -Path $sparkPath -P0 $top -C $center -P1 $right
  Add-QuadCurve -Path $sparkPath -P0 $right -C $center -P1 $bottom
  Add-QuadCurve -Path $sparkPath -P0 $bottom -C $center -P1 $left
  Add-QuadCurve -Path $sparkPath -P0 $left -C $center -P1 $top
  $sparkPath.CloseFigure()
  $Graphics.FillPath($whiteBrush, $sparkPath)

  $sparkPath.Dispose()
  $whiteBrush.Dispose()
}

# -- Rendu d'une icone --------------------------------------------
function New-IconBitmap {
  param([int]$Size, [single]$GlyphScale = 1, [switch]$Rounded)
  $bmp = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $scale = [single]($Size / 512.0)
  $g.ScaleTransform($scale, $scale)

  $bg = New-BrandBrush -W 512 -H 512
  if ($Rounded) {
    $bgPath = New-RoundedRectPath -X 0 -Y 0 -W 512 -H 512 -R 112
    $g.FillPath($bg, $bgPath)
    $bgPath.Dispose()
  } else {
    $g.FillRectangle($bg, [System.Drawing.RectangleF]::new(0, 0, 512, 512))
  }
  $bg.Dispose()

  if ($GlyphScale -ne 1) {
    $g.TranslateTransform(256, 256)
    $g.ScaleTransform($GlyphScale, $GlyphScale)
    $g.TranslateTransform(-256, -256)
  }
  Draw-BrandGlyph -Graphics $g

  $g.Dispose()
  return $bmp
}

function Save-Png {
  param([System.Drawing.Bitmap]$Bitmap, [string]$Name)
  $path = Join-Path $OutDir $Name
  $Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Bitmap.Dispose()
  $ko = [math]::Round((Get-Item $path).Length / 1KB, 1)
  Write-Host ("  {0,-24} {1,7} Ko" -f $Name, $ko)
}

function Get-IconPngBytes {
  param([int]$Size)
  $bmp = New-IconBitmap -Size $Size -Rounded
  $ms = [System.IO.MemoryStream]::new()
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $bytes = $ms.ToArray()
  $ms.Dispose()
  $bmp.Dispose()
  return $bytes
}

# Conteneur ICO (entrees PNG : acceptees par Windows Vista+ et les navigateurs).
function Save-Ico {
  param([string]$Name, [int[]]$Sizes)
  $images = @()
  foreach ($s in $Sizes) { $images += , @{ Size = $s; Bytes = (Get-IconPngBytes -Size $s) } }

  $path = Join-Path $OutDir $Name
  $fs = [System.IO.File]::Create($path)
  $bw = [System.IO.BinaryWriter]::new($fs)
  $bw.Write([uint16]0)
  $bw.Write([uint16]1)
  $bw.Write([uint16]$images.Count)

  $offset = 6 + 16 * $images.Count
  foreach ($img in $images) {
    $dim = 0
    if ($img.Size -lt 256) { $dim = $img.Size }
    $bw.Write([byte]$dim)
    $bw.Write([byte]$dim)
    $bw.Write([byte]0)
    $bw.Write([byte]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]32)
    $bw.Write([uint32]$img.Bytes.Length)
    $bw.Write([uint32]$offset)
    $offset += $img.Bytes.Length
  }
  foreach ($img in $images) {
    [byte[]]$data = $img.Bytes
    $bw.Write($data, 0, $data.Length)
  }

  $bw.Flush()
  $bw.Dispose()
  $fs.Dispose()
  $ko = [math]::Round((Get-Item $path).Length / 1KB, 1)
  Write-Host ("  {0,-24} {1,7} Ko" -f $Name, $ko)
}

# -- Image de partage (Open Graph / Twitter) ----------------------
function New-ShareImage {
  $w = 1200
  $h = 630
  $bmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bg = New-BrandBrush -W $w -H $h
  $g.FillRectangle($bg, [System.Drawing.RectangleF]::new(0, 0, $w, $h))
  $bg.Dispose()

  # Logo (glyphe seul, sans fond : il se detache du degrade)
  $markSize = [single]300
  $k = [single]($markSize / 512.0)
  $g.TranslateTransform([single]96, [single]165)
  $g.ScaleTransform($k, $k)
  Draw-BrandGlyph -Graphics $g
  $g.ResetTransform()

  $whiteBrush = [System.Drawing.SolidBrush]::new($White)
  $softBrush = [System.Drawing.SolidBrush]::new($SoftWhite)
  $ruleBrush = [System.Drawing.SolidBrush]::new($DarkerWhite)

  $fontTitle = [System.Drawing.Font]::new('Segoe UI', [single]72, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fontLead = [System.Drawing.Font]::new('Segoe UI', [single]36, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $fontMeta = [System.Drawing.Font]::new('Segoe UI', [single]26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

  $g.DrawString('CV Builder Pro', $fontTitle, $whiteBrush, [single]470, [single]200)

  $rule = New-RoundedRectPath -X 474 -Y 318 -W 120 -H 8 -R 4
  $g.FillPath($ruleBrush, $rule)
  $rule.Dispose()

  $g.DrawString("Cr${eAcute}ez un CV professionnel", $fontLead, $softBrush, [single]472, [single]356)
  $meta = "10 mod${eAcute}les $middot 8 langues $middot export PDF $middot hors ligne"
  $g.DrawString($meta, $fontMeta, $softBrush, [single]474, [single]418)

  $fontTitle.Dispose()
  $fontLead.Dispose()
  $fontMeta.Dispose()
  $whiteBrush.Dispose()
  $softBrush.Dispose()
  $ruleBrush.Dispose()
  $g.Dispose()

  Save-Png -Bitmap $bmp -Name 'og-image.png'
}

# -- Execution ----------------------------------------------------
Write-Host ''
Write-Host 'CV Builder Pro  -  generation des icones' -ForegroundColor Cyan
Write-Host ''

Save-Png -Bitmap (New-IconBitmap -Size 192 -Rounded) -Name 'icon-192.png'
Save-Png -Bitmap (New-IconBitmap -Size 512 -Rounded) -Name 'icon-512.png'
Save-Png -Bitmap (New-IconBitmap -Size 512 -GlyphScale 0.72) -Name 'icon-maskable-512.png'
Save-Png -Bitmap (New-IconBitmap -Size 180) -Name 'apple-touch-icon.png'
Save-Png -Bitmap (New-IconBitmap -Size 32 -Rounded) -Name 'favicon-32.png'
Save-Png -Bitmap (New-IconBitmap -Size 16 -Rounded) -Name 'favicon-16.png'
Save-Ico -Name 'favicon.ico' -Sizes @(16, 32, 48)
New-ShareImage

Write-Host ''
Write-Host "Termine -> $OutDir" -ForegroundColor Green
Write-Host ''
