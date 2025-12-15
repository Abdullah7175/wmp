# Environment Variable Troubleshooting

## Current Issue

The `$$343XSWE12$$$$` escaping method is still causing errors in Next.js 13.5.11.

## Solution: Try Different Methods

### Method 1: Single Quotes (Try This First)
```env
WHATSAPP_SECRET_KEY='$343XSWE12$$'
```

### Method 2: Double Quotes
```env
WHATSAPP_SECRET_KEY="$343XSWE12$$"
```

### Method 3: No Quotes, Different Escaping
```env
WHATSAPP_SECRET_KEY=\$343XSWE12\$\$
```

### Method 4: Use .env.local Instead
Create a `.env.local` file (this takes precedence over `.env`):
```bash
cp .env .env.local
# Then edit .env.local and try Method 1 or 2
```

### Method 5: Remove from .env, Set at Runtime
Remove `WHATSAPP_SECRET_KEY` from `.env` and set it as an environment variable when starting:
```bash
WHATSAPP_SECRET_KEY='$343XSWE12$$' npm run dev
```

## Quick Test Script

Create a test file to see what Next.js is actually reading:

```bash
# Create test-env.js
cat > test-env.js << 'EOF'
require('dotenv').config();
console.log('WHATSAPP_SECRET_KEY:', process.env.WHATSAPP_SECRET_KEY);
console.log('Length:', process.env.WHATSAPP_SECRET_KEY?.length);
console.log('Chars:', process.env.WHATSAPP_SECRET_KEY?.split(''));
EOF

# Run it
node test-env.js
```

This will show you exactly what value is being read.

