# Strumenti di bilanciamento

Simulano migliaia di partite senza grafica, con un bot che gioca da solo, per capire quanto sono forti eroi, boss, reliquie e regioni. Serve **Node.js 18 o successivo**; non serve installare altro.

## Mini-verifica (da fare a fine di ogni fase)

```
node tools/verifica.js
```

30 partite per eroe, in parallelo, in circa 8 minuti. Alla fine stampa le vittorie per eroe, segnala chi si allontana di più di 20 punti dalla media e conta errori di gioco e partite bloccate.

- **ESITO: OK**: nessun errore di gioco e al massimo il 2% di partite bloccate.
- **ESITO: DA CONTROLLARE**: c'è almeno un errore o troppi blocchi. Con `DEBUG=1` il simulatore descrive dove si blocca.

Riferimento della v1.2.2: 70% di vittorie complessive (Noctis 37%, Poivrons 93%, gli altri tra 53% e 87%).

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
