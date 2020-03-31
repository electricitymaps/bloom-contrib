import csv

# Load concordance table in memory, indexed by coicop category
CONCORDANCE_TABLE = {}


def parse_value(k, v):
    if '%' in v:
        # Assume percentage
        return float(v.replace('%', '').replace(',', '.')) / 100
    else:
        raise Exception(f"Don't know how to parse value '{v}' at key '{k}'")


with open('COICOP_EU_ini.csv') as f:
    reader = csv.DictReader(f, delimiter=',')
    for row in reader:
        key = row['coicopCode']
        mapping = dict([
            (k, parse_value(k, v))
            for (k, v) in row.items()
            if 'coicop' not in k.lower() and k not in ['\ufeff', '', 'label'] and parse_value(k, v) > 0
        ])
        # print(mapping)
        CONCORDANCE_TABLE[key] = mapping

# Load emission factors in memory
LIFECYCLE_EMISSIONS = {}
COUNTRY_CODES = set()
with open('scope.csv') as f:
    reader = csv.DictReader(f, delimiter=',')
    for row in reader:
        country_code = row['region']
        COUNTRY_CODES.add(country_code)
        if country_code not in LIFECYCLE_EMISSIONS:
            LIFECYCLE_EMISSIONS[country_code] = {}
        sector = row['sector']
        intensity_kg_CO2e_per_M_EUR = row['Total lifecycle']
        LIFECYCLE_EMISSIONS[country_code][sector] = float(intensity_kg_CO2e_per_M_EUR) * 1e6

# Scalar product
COICOP_FOOTPRINTS = {}
for (key, mapping) in CONCORDANCE_TABLE.items():
    for country_code in sorted(COUNTRY_CODES):
        if key not in COICOP_FOOTPRINTS:
            COICOP_FOOTPRINTS[key] = {}

        for exiobase_category in mapping.keys():
            if exiobase_category not in LIFECYCLE_EMISSIONS[country_code]:
                raise Exception(f"Concordance table identifier '{exiobase_category}' was not found in scope.csv for country {country_code}")

        COICOP_FOOTPRINTS[key][country_code] = sum([
            weight * LIFECYCLE_EMISSIONS[country_code][exiobase_category]
            for (exiobase_category, weight) in mapping.items()
        ])
        print(key, country_code, COICOP_FOOTPRINTS[key][country_code])

# TODO: Set year in footprints.yml