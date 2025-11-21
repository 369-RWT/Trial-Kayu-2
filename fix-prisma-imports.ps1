# Fix Prisma Client imports across all files
$files = @(
    "app\reports\waste-analysis\page.tsx",
    "app\reports\supplier-performance\page.tsx",
    "app\reports\page.tsx",
    "app\reports\cost-breakdown\page.tsx",
    "app\production\batches\page.tsx",
    "app\master\workers\page.tsx",
    "app\master\wood-types\page.tsx",
    "app\master\suppliers\page.tsx",
    "app\master\products\page.tsx",
    "app\master\pricing\page.tsx",
    "app\master\machines\page.tsx",
    "app\inventory\valuation\page.tsx",
    "app\inventory\logs\page.tsx",
    "app\inventory\logs\new\page.tsx",
    "app\api\inventory\logs\route.ts",
    "app\api\health\route.ts"
)

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Replace PrismaClient import
        $content = $content -replace 'import \{ PrismaClient \} from "@prisma/client";', 'import prisma from "@/lib/prisma";'
        
        # Remove const prisma = new PrismaClient() line
        $content = $content -replace 'const prisma = new PrismaClient\(\);[\r\n]*', ''
        
        Set-Content $filePath $content -NoNewline
        Write-Host "✓ Fixed: $file"
    } else {
        Write-Host "✗ Not found: $file"
    }
}

Write-Host "`n✅ All files have been updated!"
