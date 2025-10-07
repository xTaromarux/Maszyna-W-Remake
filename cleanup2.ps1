$files = @(
    "src\components\Main.vue",
    "src\workers\chat.worker.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Przetwarzam: $file" -ForegroundColor Yellow
        
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        $originalContent = $content
        
        $content = $content -replace '\s*//[^\r\n]*', ''
        
        $content = $content -replace '(?m)\s+$', ''
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Usunieto komentarze z: $file" -ForegroundColor Green
        } else {
            Write-Host "Brak komentarzy w: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "Plik nie istnieje: $file" -ForegroundColor Red
    }
}