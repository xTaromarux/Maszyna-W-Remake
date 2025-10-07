# Skrypt do usuwania komentarzy z plików CSS/SCSS
param(
    [string]$Path = "src",
    [switch]$DryRun = $false
)

function Remove-CSSComments {
    param(
        [string]$FilePath,
        [bool]$DryRun = $false
    )
    
    Write-Host "Przetwarzam: $FilePath" -ForegroundColor Yellow
    
    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # Usuń komentarze CSS /* */ (wieloliniowe i jednoliniowe)
    $content = $content -replace '(?s)/\*.*?\*/', ''
    
    # Usuń komentarze // w SCSS (ale zachowaj URL-e)
    $content = $content -replace '(?<!:)//(?!\s*https?://).*$', ''
    
    # Usuń puste linie (maksymalnie 2 pod rząd)
    $content = $content -replace '(?m)^\s*\r?\n', "`n"
    $content = $content -replace '\n{3,}', "`n`n"
    
    # Usuń nadmiarowe spacje na końcu linii
    $content = $content -replace '(?m)\s+$', ''
    
    if ($content -ne $originalContent) {
        if (-not $DryRun) {
            Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✓ Usunięto komentarze z: $FilePath" -ForegroundColor Green
        } else {
            Write-Host "✓ Znaleziono komentarze do usunięcia w: $FilePath" -ForegroundColor Cyan
        }
        return $true
    } else {
        Write-Host "- Brak komentarzy w: $FilePath" -ForegroundColor Gray
        return $false
    }
}

# Znajdź wszystkie pliki CSS/SCSS w katalogu src
$files = Get-ChildItem -Path $Path -Recurse -Include "*.css", "*.scss" | Where-Object { $_.Name -notlike "*.min.*" }

$processedCount = 0
$modifiedCount = 0

Write-Host "Znaleziono $($files.Count) plików CSS/SCSS do przetworzenia..." -ForegroundColor Cyan

foreach ($file in $files) {
    $processedCount++
    $modified = Remove-CSSComments -FilePath $file.FullName -DryRun $DryRun
    if ($modified) {
        $modifiedCount++
    }
}

Write-Host "`nPodsumowanie:" -ForegroundColor White
Write-Host "Przetworzonych plików: $processedCount" -ForegroundColor White
Write-Host "Zmodyfikowanych plików: $modifiedCount" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`nTo był tryb testowy. Aby faktycznie usunąć komentarze, uruchom bez parametru -DryRun" -ForegroundColor Yellow
}