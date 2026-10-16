# Strumenti di bilanciamento e di disegno

Simulano migliaia di partite senza grafica, con un bot che gioca da solo, per capire quanto sono forti eroi, boss, reliquie e regioni. Serve **Node.js 18 o successivo**; non serve installare altro.

## Mini-verifica (da fare a fine di ogni fase)

```
node tools/verifica.js
```

30 partite per eroe, in parallelo, in circa 8 minuti. Alla fine stampa le vittorie per eroe, segnala chi si allontana di più di 20 punti dalla media e conta errori di gioco e partite bloccate.

- **ESITO: OK**: nessun errore di gioco e al massimo il 2% di partite bloccate.
- **ESITO: DA CONTROLLARE**: c'è almeno un errore o troppi blocchi. Con `DEBUG=1` il simulatore descrive dove si blocca.

Riferimenti (30 partite per eroe, margine circa ±17 punti):

- v1.2.2: 70% di vittorie complessive (Noctis 37%, Poivrons 93%, gli altri tra 53% e 87%).
- v1.3.0: 67% (Barbataus 40%, Noctis 43%, Tasarau 57%, Carrapax 90%, Poivrons 87%). Orrore Profondo ora è di Fuoco e penalizza gli eroi della Foresta.
- v1.4.0: identica alla v1.3.0 (la fase ha cambiato solo la grafica).
- v1.5.0: 68% (Noctis 20%, Tasarau 43%, Elios 43%, Poivrons 97%, Carrapax 97%). Nuove regioni e boss: Aracno, Lavion, Armageddon; Obscurio spostato in Oscuro Orizzonte.

## Batteria completa

```
node tools/batteria.js sempre,tattico,abilita --partite 50
node tools/analisi.js tools/out/<file>.jsonl
```

| Esperimento | Cosa misura |
|---|---|
| `verifica` | 30 partite per eroe, stile "usa sempre tutto" |
| `sempre` | Vittorie e **duelli coi boss** ripetuti da checkpoint |
| `tattico` | Abilità usate solo quando convengono (secondo stile di gioco) |
| `abilita` | Un'abilità tolta alla volta: quanto conta ciascuna |
| `doni` | Doni scelti a caso: quanto conta scegliere bene |
| `eclissi` | Eclissi III |
| `base` / `completo` | Senza reliquie né Doni / con tutto dall'inizio |
| `risonanze` | 4 reliquie della stessa affinità dall'inizio |
| `reliquie` | Ogni reliquia data all'inizio |

Opzioni: `--partite N` (partite per eroe), `--processi P` (processi in parallelo, di base i core meno uno), `--eroi gheos,noctis`.

Tutti gli eroi giocano sugli **stessi semi** e su tutti i percorsi possibili in parti uguali, così i confronti sono equi. Le percentuali dell'analisi hanno l'intervallo di confidenza al 95%. I risultati finiscono in `tools/out/`, che è escluso dal repo.

## Come funziona

- `lib/gioco.js` carica in Node i file di logica del gioco, nell'ordine di `index.html` e senza quelli di grafica e input.
- `sim.js` gioca le partite di una configurazione e stampa i risultati in JSON.
- `batteria.js` lancia molti `sim.js` in parallelo.
- `analisi.js` produce le tabelle.

Il bot è volutamente semplice: non sa tenersi a distanza né usare bene il terreno. Per questo conta il **confronto** tra eroi più dei valori assoluti.

## Sprite e ritratti dei personaggi (`tools/pixel`)

Gli eroi, il Vecchio Saggio e i grandi nemici dell'era sono disegnati a mano con forme geometriche (ellissi, poligoni, linee) su una griglia, guardando carte e statuine dell'archivio locale `riferimenti/` (che non viene pubblicato).

- `pittore.js`: la "tela" con le forme e le ombreggiature.
- `disegni.js`: gli sprite della mappa (16×16, boss 24×24); `ritratti.js`: i ritratti 48×48.
- `genera.js` scrive `js/volti.js`, che il gioco carica dopo gli altri sprite:

```
node tools/pixel/genera.js
node tools/pixel/anteprima.js anteprima.png gheos magor ritratto:gheos --scala 8
```

`anteprima.js` disegna sprite (`nome`) e ritratti (`ritratto:nome`) ingranditi, con la tavolozza e il contorno del gioco. Non modificare `js/volti.js` a mano: va rigenerato.
