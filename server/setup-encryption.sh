#!/bin/bash
# Encryption Setup Script for FortiFi Bank Asset Recovery Platform

echo "🔐 FortiFi Encryption Setup"
echo "=============================="
echo ""

# Check if encryption key already exists
if [ -f .env ] && grep -q "ENCRYPTION_KEY=" .env; then
    echo "⚠️  ENCRYPTION_KEY already exists in .env file"
    read -p "Do you want to generate a new key? (y/n): " generate_new
    if [ "$generate_new" != "y" ]; then
        echo "Skipping key generation"
        exit 0
    fi
fi

# Generate new encryption key
echo "Generating new 256-bit (32-byte) encryption key..."
ENCRYPTION_KEY=$(openssl rand -hex 32)

echo ""
echo "✅ Encryption Key Generated:"
echo "=============================="
echo "$ENCRYPTION_KEY"
echo ""

# Create or update .env file
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

# Update ENCRYPTION_KEY in .env
if grep -q "ENCRYPTION_KEY=" .env; then
    # macOS requires different sed syntax
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    else
        sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    fi
else
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env
fi

echo "✅ Encryption key added to .env file"
echo ""
echo "🔒 Security Reminders:"
echo "  • Never commit .env to version control"
echo "  • Store this key in Azure Key Vault for production"
echo "  • Rotate the key every 90 days"
echo "  • Keep the key secure and backed up safely"
echo ""
echo "📋 Next Steps:"
echo "  1. Review ENCRYPTION_GUIDE.md for implementation details"
echo "  2. Test encryption with sample asset upload"
echo "  3. Configure Azure Key Vault for production deployment"
echo "  4. Enable encryption audit logging"
echo ""
