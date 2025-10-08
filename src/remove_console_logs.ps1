# PowerShell script to remove console logs from all frontend files

Write-Host "Starting console log removal from frontend files..."

# Get all JSX and JS files
$files = Get-ChildItem -Recurse -Include "*.jsx", "*.js" | Where-Object { $_.FullName -notlike "*node_modules*" }

$totalFiles = $files.Count
$processedFiles = 0
$totalLogsRemoved = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Count console logs before removal
    $beforeCount = ([regex]::Matches($content, "console\.(log|error|warn|info|debug)")).Count
    
    if ($beforeCount -gt 0) {
        # Remove console.log, console.error, console.warn, console.info, console.debug statements
        # This regex matches console statements and removes the entire line
        $content = $content -replace "(?m)^\s*console\.(log|error|warn|info|debug)\([^;]*\);?\s*$", ""
        
        # Remove console statements that are part of multi-line expressions
        $content = $content -replace "console\.(log|error|warn|info|debug)\([^)]*\);?", ""
        
        # Clean up empty lines (remove lines that only contain whitespace)
        $content = $content -replace "(?m)^\s*$\n", ""
        
        # Save the file
        Set-Content $file.FullName -Value $content -NoNewline
        
        $logsRemoved = $beforeCount
        $totalLogsRemoved += $logsRemoved
        
        Write-Host "Processed: $($file.Name) - Removed $logsRemoved console logs"
    }
    
    $processedFiles++
}

Write-Host "`nCompleted! Processed $processedFiles files and removed $totalLogsRemoved console logs total."
Write-Host "Removing the script file..."
Remove-Item $MyInvocation.MyCommand.Path
