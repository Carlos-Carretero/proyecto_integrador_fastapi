param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
    Write-Error "DATABASE_URL env var not set."
    exit 1
}

Write-Output "Running Alembic migrations against $DatabaseUrl"
$env:DATABASE_URL = $DatabaseUrl
alembic upgrade head
