# Skrypt do usuwania komentarzy inline z pliku Main.vue
param(
    [string]$FilePath = "src\components\Main.vue",
    [switch]$DryRun = $false
)

function Remove-InlineComments {
    param(
        [string]$FilePath,
        [bool]$DryRun = $false
    )
    
    Write-Host "Przetwarzam: $FilePath" -ForegroundColor Yellow
    
    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # Usuń komentarze inline // ale zachowaj URL-e i operatory
    $content = $content -replace '(?<!:)(?<!/)//(?!\s*https?://)(?!/)\s*[^/\r\n]*$', ''
    
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

if (Test-Path $FilePath) {
    $modified = Remove-InlineComments -FilePath $FilePath -DryRun $DryRun
    if ($modified) {
        Write-Host "Plik został zmodyfikowany" -ForegroundColor Green
    } else {
        Write-Host "Brak zmian w pliku" -ForegroundColor Gray
    }
} else {
    Write-Host "Plik nie istnieje: $FilePath" -ForegroundColor Red
}