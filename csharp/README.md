### Build nupkg file
```shell
docker run --rm -v ${PWD}:/app -w /app mcr.microsoft.com/dotnet/sdk:8.0 dotnet pack -c Release -o /app/out
```

