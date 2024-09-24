### Compile
```shell
docker run --rm -v ${PWD}:/app -w /app mcr.microsoft.com/dotnet/sdk:8.0 dotnet build TrustElevateSDK.sln
```

### Test
```shell
docker run --rm -v ${PWD}:/app -w /app mcr.microsoft.com/dotnet/sdk:8.0 dotnet test
```

### Build nupkg file
Before publishing ensure you bump the version in the TrustElevateSDK.csproj appropriately
```shell
docker run --rm -v ${PWD}:/app -w /app mcr.microsoft.com/dotnet/sdk:8.0 dotnet pack -c Release -o /app/out
```
Go to https://www.nuget.org/packages/manage/upload and upload the nupkg file.

