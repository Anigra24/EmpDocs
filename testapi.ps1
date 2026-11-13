# EmpDocs Task D test runner
# IMPORTANT: Keep the entire file intact. Invoke-Api is defined below and used by all tests.
# EmpDocs - Task D API Test Runner
# Run the API server in another PowerShell window before executing this script.
# Usage:
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\test-api.ps1
#
# The script creates one test employee, exercises the CRUD/list APIs and
# negative cases, then deletes the test employee at the end.

$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000/api/employees"

$script:Passed = 0
$script:Failed = 0
$script:EmployeeId = $null
$script:CreatedEmployee = $null

function Invoke-Api {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Uri,
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][int]$ExpectedStatus,
        [string]$Body
    )

    try {
        $request = @{
            Uri         = $Uri
            Method      = $Method
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }

        if ($PSBoundParameters.ContainsKey("Body")) {
            $request.ContentType = "application/json"
            $request.Body = $Body
        }

        $response = Invoke-WebRequest @request
        $actualStatus = [int]$response.StatusCode
        $content = $response.Content
    }
    catch {
        $webResponse = $_.Exception.Response

        if ($null -ne $webResponse) {
            try {
                $actualStatus = [int]$webResponse.StatusCode
            }
            catch {
                $actualStatus = 0
            }

            try {
                $stream = $webResponse.GetResponseStream()
                if ($null -ne $stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $content = $reader.ReadToEnd()
                    $reader.Dispose()
                }
                else {
                    $content = $_.ErrorDetails.Message
                }
            }
            catch {
                $content = $_.ErrorDetails.Message
            }
        }
        else {
            $actualStatus = 0
            $content = $_.Exception.Message
        }
    }

    $parsed = $null
    if (-not [string]::IsNullOrWhiteSpace($content)) {
        try {
            $parsed = $content | ConvertFrom-Json
        }
        catch {
            $parsed = $null
        }
    }

    if ($actualStatus -eq $ExpectedStatus) {
        $script:Passed++
        Write-Host "[PASS] $Name (HTTP $actualStatus)" -ForegroundColor Green
    }
    else {
        $script:Failed++
        Write-Host "[FAIL] $Name - expected HTTP $ExpectedStatus, received HTTP $actualStatus" -ForegroundColor Red
        if ($content) {
            Write-Host $content
        }