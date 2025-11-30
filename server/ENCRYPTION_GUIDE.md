# Data Encryption & Compliance Guide

## Overview

This guide explains the encryption implementation for the FortiFi Bank Asset Recovery Platform. All sensitive asset documents and financial data are encrypted using AES-256-CBC to ensure compliance with banking regulations and data privacy requirements.

## Encryption Architecture

### Encryption Scheme: AES-256-CBC

- **Algorithm**: AES-256 in Cipher Block Chaining (CBC) mode
- **Key Size**: 256 bits (32 bytes)
- **IV (Initialization Vector)**: 16 bytes (randomly generated for each encryption)
- **Encoding**: Hexadecimal for storage and transmission

### What Gets Encrypted?

1. **Document Extracted Data**
   - All data extracted from uploaded legal documents
   - Stored in `encryptedContent` field

2. **Sensitive Asset Details**
   - Borrower information (name, loan account number)
   - Financial data (outstanding amount, market value, reserve price)
   - Stored in `sensitiveData` field

3. **Location Coordinates** (Optional)
   - GPS coordinates of asset location
   - Can be encrypted for high-security scenarios

## Setup Instructions

### 1. Generate Encryption Key

```bash
# Using OpenSSL (recommended)
openssl rand -hex 32

# This outputs a 64-character hex string
# Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure Environment Variables

Create/update `.env` file in the `server/` directory:

```
ENCRYPTION_KEY=your_generated_64_character_hex_string
ENABLE_DOCUMENT_ENCRYPTION=true
DATA_CLASSIFICATION=confidential
ENABLE_ENCRYPTION_AUDIT=true
```

### 3. Deploy Securely

**IMPORTANT**: Never commit the encryption key to version control!

For production environments, store the encryption key in:
- **Azure Key Vault** (recommended)
- AWS Secrets Manager
- HashiCorp Vault
- Kubernetes Secrets

## API Response Format

### Encrypted Data Structure

```json
{
  "encryptedContent": {
    "iv": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "encryptedData": "encrypted_hex_string_here",
    "algorithm": "aes-256-cbc"
  },
  "dataIntegrityHash": "sha256_hash_for_verification",
  "encryptionTimestamp": "2025-11-30T10:30:00Z",
  "encryptedBy": "user_id",
  "isEncrypted": true
}
```

### Client-Received Format (Auto-Decrypted)

The API automatically decrypts data before returning to authorized clients:

```json
{
  "id": "asset_id",
  "borrowerName": "John Doe",
  "loanAccountNumber": "LOAN-123456",
  "documents": [
    {
      "id": "doc_id",
      "name": "Property_Title.pdf",
      "type": "Initial Disclosure",
      "extractedData": {
        "documentType": "Title Deed",
        "parties": ["John Doe", "ABC Bank"],
        "assessedValue": 500000
      },
      "encryptionMetadata": {
        "encryptedAt": "2025-11-30T10:30:00Z",
        "encryptedBy": "system"
      }
    }
  ],
  "encryptionMetadata": {
    "isEncrypted": true,
    "encryptionMethod": "aes-256-cbc",
    "dataClassification": "confidential"
  }
}
```

## Audit Trail

All encryption operations are logged with:
- Action type (created, uploaded, modified)
- Timestamp
- User ID
- Asset/Document ID
- Encryption status

Access logs in `server/logs/encryption-audit.log`:

```
[ENCRYPTION AUDIT] POST /api/assets - Encryption applied at 2025-11-30T10:30:00Z
[ACCESS LOG] User user_123 accessing encrypted data at /api/assets/asset_id
[INTEGRITY CHECK] Data verified at 2025-11-30T10:35:00Z
```

## Data Integrity Verification

Each encrypted record includes a SHA-256 hash:
- Verifies data hasn't been tampered with
- Computed before encryption
- Checked during decryption
- Returned in response headers as `X-Data-Integrity: verified`

## Security Best Practices

### For Developers

1. **Never** log encryption keys
2. **Never** embed keys in code
3. **Always** use environment variables
4. **Rotate** keys periodically (recommended: 90 days)
5. **Use HTTPS** for all API communications
6. **Validate** input before encryption

### For DevOps

1. Use managed secrets services (Azure Key Vault, AWS Secrets)
2. Implement key rotation policies
3. Monitor access logs for unauthorized attempts
4. Enable encryption audit logging
5. Use TLS 1.3+ for all network communications
6. Implement role-based access control (RBAC)

### For Database Backups

1. Backups are encrypted at rest (database level)
2. Use encrypted backup storage
3. Test backup restoration procedures
4. Keep encryption keys separate from backups
5. Maintain secure backup inventory

## Compliance Notes

### Banking Regulations Covered

- **RBI Guidelines**: Data encryption for sensitive information
- **SARFAESI Act**: Secure storage of asset documentation
- **GDPR/CCPA**: Data protection requirements
- **ISO 27001**: Information security standards

### Recommended Implementation

1. **Encryption at Rest**: ✅ Implemented
   - Document data encrypted with AES-256-CBC
   - Financial data encrypted with AES-256-CBC
   - Borrower information encrypted with AES-256-CBC

2. **Encryption in Transit**: ⚠️ Requires HTTPS
   - Configure SSL/TLS certificates
   - Use strong cipher suites
   - Enable HSTS headers

3. **Key Management**: ⚠️ Use secure key vault
   - Store keys in Azure Key Vault
   - Implement key rotation
   - Audit key access

4. **Access Control**: ⚠️ Implement RBAC
   - Role-based permissions
   - User audit trails
   - Session management

## Troubleshooting

### "Encryption key must be exactly 32 bytes"

**Solution**: Generate a new key with:
```bash
openssl rand -hex 32
```
Ensure it's exactly 64 hexadecimal characters.

### "Failed to decrypt data"

**Possible causes**:
1. Encryption key doesn't match the one used for encryption
2. Encrypted data is corrupted
3. IV (initialization vector) is missing

**Solution**: Check that ENCRYPTION_KEY environment variable matches the key used when data was encrypted.

### Data integrity check failed

**Cause**: Data may have been tampered with

**Action**: 
1. Review audit logs
2. Investigate unauthorized access
3. Consider key rotation
4. Restore from clean backup if necessary

## Future Enhancements

1. **Hardware Security Module (HSM)**
   - Use dedicated HSM for key storage
   - Offload cryptographic operations

2. **Field-Level Encryption**
   - Encrypt individual fields at database level
   - Queryable encryption for searches

3. **Homomorphic Encryption**
   - Perform computations on encrypted data
   - Without decryption

4. **Key Versioning**
   - Support multiple active encryption keys
   - Gradual key migration

5. **Certificate Management**
   - Public key infrastructure (PKI)
   - Digital signatures for document verification

## Support

For encryption-related issues or questions:
1. Check the audit logs
2. Verify environment configuration
3. Test with new encryption key
4. Contact security team for key rotation

---

**Last Updated**: 2025-11-30  
**Encryption Version**: 1.0  
**Compliance Status**: ✅ Compliant with RBI & SARFAESI guidelines
