# Fix all API routes to use request.nextUrl and add dynamic export
$files = @(
    "app\api\reports\inventory-valuation\route.ts",
    "app\api\reports\daily-production\route.ts",
    "app\api\production\batches\route.ts",
    "app\api\master\wood-types\route.ts",
    "app\api\master\machine-types\route.ts",
    "app\api\master\pricing\route.ts",
    "app\api\master\products\route.ts",
    "app\api\master\suppliers\route.ts",
    "app\api\master\workers\route.ts",
    "app\api\inventory\logs\route.ts"
)

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Replace new URL(request.url) with request.nextUrl
        $content = $content -replace 'new URL\(request\.url\)', 'request.nextUrl'
        
        # Add dynamic export if not present
        if ($content -notmatch "export const dynamic") {
            # Find the position after imports and before first export function
            $content = $content -replace '(import.*?\r?\n)+(\r?\n)(export async function)', "`$1`$2// Force dynamic rendering for this route`r`nexport const dynamic = 'force-dynamic';`r`n`r`n`$3"
        }
        
        Set-Content $filePath $content -NoNewline
        Write-Host "✓ Fixed: $file"
    } else {
        Write-Host "✗ Not found: $file"
    }
}

Write-Host "`n✅ All API routes have been updated!"
