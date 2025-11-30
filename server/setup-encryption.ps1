# Encryption Setup Script for FortiFi Bank Asset Recovery Platform (Windows)
# Run as Administrator

Write-Host "🔐 FortiFi Encryption Setup" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

# Check if .env file exists and has ENCRYPTION_KEY
$envFile = ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    if ($envContent -match "ENCRYPTION_KEY=") {
        Write-Host "⚠️  ENCRYPTION_KEY already exists in .env file" -ForegroundColor Yellow
        $generate_new = Read-Host "Do you want to generate a new key? (y/n)"
        if ($generate_new -ne "y") {
            Write-Host "Skipping key generation"
            exit 0
        }
    }
}

# Generate new encryption key using .NET cryptography
Write-Host "Generating new 256-bit (32-byte) encryption key..." -ForegroundColor Yellow

# Use .NET to generate random bytes
$bytes = [byte[]]::new(32)
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
$rng.GetBytes($bytes)
$ENCRYPTION_KEY = ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""

Write-Host ""
Write-Host "✅ Encryption Key Generated:" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host $ENCRYPTION_KEY -ForegroundColor Cyan
Write-Host ""

# Create or update .env file
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" $envFile
    } else {
        Write-Host "Warning: .env.example not found" -ForegroundColor Yellow
    }
}

# Update or add ENCRYPTION_KEY in .env
$envContent = Get-Content $envFile -Raw
if ($envContent -match "ENCRYPTION_KEY=") {
    $envContent = $envContent -replace "ENCRYPTION_KEY=.*", "ENCRYPTION_KEY=$ENCRYPTION_KEY"
} else {
    $envContent += "`nENCRYPTION_KEY=$ENCRYPTION_KEY`n"
}

Set-Content $envFile $envContent -Encoding UTF8

Write-Host "✅ Encryption key added to .env file" -ForegroundColor Green
Write-Host ""
Write-Host "🔒 Security Reminders:" -ForegroundColor Cyan
Write-Host "  • Never commit .env to version control"
Write-Host "  • Store this key in Azure Key Vault for production"
Write-Host "  • Rotate the key every 90 days"
Write-Host "  • Keep the key secure and backed up safely"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review ENCRYPTION_GUIDE.md for implementation details"
Write-Host "  2. Test encryption with sample asset upload"
Write-Host "  3. Configure Azure Key Vault for production deployment"
Write-Host "  4. Enable encryption audit logging"
Write-Host ""

# Save the key to clipboard (optional)
$clipboardChoice = Read-Host "Copy encryption key to clipboard? (y/n)"
if ($clipboardChoice -eq "y") {
    $ENCRYPTION_KEY | Set-Clipboard
    Write-Host "✅ Key copied to clipboard" -ForegroundColor Green
}
