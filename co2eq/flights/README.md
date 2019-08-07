# Flights

## How to generate airports.json
Dependencies
```bash
brew install jq
npm install -g dsv2json
```

```bash
wget https://datahub.io/core/airport-codes/r/airport-codes.csv
cat airport-codes.csv | csv2json -n | jq -s '.[] | select(.iata_code!="") | {iata_code,name,lonlat: (.coordinates / ", " | map(. | tonumber))}' | jq -s 'INDEX(.iata_code)' > airports.json
```

**Update:** The source file has encoding problems, and the file have been manually updated.