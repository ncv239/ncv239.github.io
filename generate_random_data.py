import random
import json

#  Load provider names
with open("provider_names.txt", "r") as f:
    providers = f.readlines()
    maxProviders = len(providers)

#  Load company names
with open("company_names.txt", "r") as f:
    company = f.readlines()
    random.shuffle(company)

#  Load locations names
with open("georef-germany-postleitzahl.csv", "r") as f:
    data = f.readlines()
    locations = [row.split(";")[2] for row in data]
    maxLocations = len(locations)


def random_tel():
    d1 = random.randint(0,9)
    d2 = random.randint(0,9)
    d3 = random.randint(0,9)
    d4 = random.randint(0,9)
    d5 = random.randint(0,9)
    d6 = random.randint(0,9)
    d7 = random.randint(0,9)
    d8 = random.randint(0,9)
    d9 = random.randint(0,9)
    d10 = random.randint(0,9)
    d11= random.randint(0,9)
    d12 = random.randint(0,9)
    return f"{d1}{d2}{d3} / {d4}{d5}{d6}{d7} - {d8}{d9} {d10}{d11}{d12}"

ITEM = {
        "name": "___",
        "place": "___",
        "provider": "___",
        "tel": "___",

        "Heimerziehung" : False,
        "Tagesgruppe" : False,
        "Eingliederungshilfe" : False,
        "Geistig / körperlich Behinderte" : False,
        "Für Mütter/Väter und Kinder" : False,
        "Intens. sozialpäd. Einzelbetreuung" : False,
        "Familienanaloge Angebote" : False,
        "Internate / Schülerwohnheime" : False,
        "Pädagogische Schwerpunkte</span>" : False,
        "unbegl. minderj. Ausländer/innen" : False,
        "Mädchenwohngruppe" : False,
        "Jungenwohngruppe" : False,
        "Inobhutnahme" : False,
        "Drogen- und Suchthilfe" : False,
        "Interne Beschulung / Ausbildung" : False,
        "Hilfe nach (sexueller) Gewalt" :False
}

data = []
for i in range(1000):
    item = ITEM.copy()

    for k, v in item.items():
        item[k] = random.choice([True, False])

    item["name"] =  company.pop().strip()
    item["place"] =  locations[random.randint(0, maxLocations-1)].strip()
    item["provider"] = providers[random.randint(0, maxProviders-1)].strip()
    item["tel"] =  random_tel()
    item["id"] =  i

    data.append(item)

with open("data_generated.json", "w") as f:
    json.dump(data, f)