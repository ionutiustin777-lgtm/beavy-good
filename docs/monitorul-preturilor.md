# Monitorul Prețurilor

Sursă aleasă pentru prețuri de raft. Implementarea așteaptă pasul 5. Nu se folosește încă în calcul.

Aplicația citește direct API-ul public al serviciului oficial, `monitorulpreturilor.info`. Proiectul care a documentat contractul este [gov2-ro/monitorulpreturilor](https://github.com/gov2-ro/monitorulpreturilor) („Interfață alternativă pentru monitorulpreturilor.info”). Depozitul lor nu are licență declarată: datele publice se pot citi, codul lor nu se copiază.

Clientul Beavy se scrie de la zero, după contractul endpoint-urilor, nu după scripturile lor Python (`fetch_prices.py`, `api.py`, `units.py`, `config/networks.json`).

## Endpoint-uri

- Catalog: `https://monitorulpreturilor.info/pmonsvc/Retail/GetCatalogProductsByNameNetwork`
- Prețuri pe magazine, după coordonate: `GetStoresForProductsByLatLon`

Aceasta este sursa LatLon, nu varianta pe localitate (`GetStoresForProductsByUat`) din repo-ul vechi.

## Reguli când se implementează

- Apel doar de pe server.
- Prețul păstrează data raportată de sursă. Ora cererii nu o înlocuiește.
- Fără sursă, canal și moment al observării, oferta nu intră în calcul.
- METRO rămâne exclus. Selgros (B2B) nu intră în clasament.
- Doar alimentare.
