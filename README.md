# Beavy

Beavy spune cât costă coșul final, nu doar produsul.

Un preț intră în calcul doar dacă are sursă, canal (raft sau livrare) și momentul observării. Fără aceste trei, prețul nu se afișează ca ofertă.

## Reguli

- Doar produse alimentare. Băuturile cu garanție SGR rămân.
- METRO nu intră în niciun calcul.
- LaRaft nu este sursă.
- Promoția se evaluează pe cantitatea cerută. 1+1 nu e avantaj dacă ai nevoie de o bucată.
- Garanția SGR (0,50 lei/ambalaj) e o linie separată, nu face parte din prețul produsului.
- Transportul și taxele intră în total. Un coș ieftin pe hârtie poate fi mai scump după livrare.
- Nu se copiază cod din alte depozite fără licență. Datele publice se citesc prin client propriu.

## Trei întrebări

1. Cel mai ieftin produs exact: unde cumpăr produsul din listă la cel mai mic preț?
2. Cea mai bună alternativă: ce produs comparabil, în același magazin, reduce costul fără un compromis important?
3. Cel mai ieftin coș final: cât plătesc în total, cu alternative, promoții, SGR, transport și taxe?

Întrebarea 3 este obiectivul.

## Ordinea de construire

Un pas, un pull request. Nu sărim peste.

1. Regulile (acest fișier).
2. Un produs și o ofertă, fără scrapere.
3. Totalul coșului la un singur magazin.
4. SGR ca linie separată.
5. O singură sursă live.

Până la pasul 5 nu intră Monitorul Prețurilor, Apify, Sezamo, Freshful sau un optimizator pe mai multe magazine.

Repo-ul vechi `beavy` rămâne neatins.
