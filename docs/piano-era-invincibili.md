# Piano: il gioco nell'Era degli Invincibili Signori della Natura

Piano a fasi (aggiornato il 2026-10-14). Due obiettivi: rendere il gioco coerente con la storia
originale (dalla Prima Serie a Final Evolution, vedi `lore-era-invincibili.md`) e realizzare i
major update adattati a quella storia. Ogni fase è un rilascio giocabile, con la versione nel
commit e nel menu.

**Decisioni prese dall'utente:**
- titolo "L'Occhio della Vita";
- Pianura delle Nebbie con Lavion;
- solo guerrieri con nome come nemici (più qualche creatura maledetta di contorno);
- il Vecchio Saggio resta **eroe giocabile extra** ed è anche **guida e narratore**;
- **gli antagonisti dell'era diventano giocabili** nella **Campagna del Male**;
- **Magor** è narratore della Campagna del Male e **personaggio segreto giocabile**, come il Saggio per i buoni;
- l'ultimo scontro della Campagna del Male è contro il **Vecchio Saggio insieme al Sommo Luminescente**;
- **gli sprite dei personaggi vanno rifatti fedeli alle immagini originali** (carte e statuine).

## Requisiti validi per tutte le fasi
- **Salvataggio esportabile e importabile**: tutto ciò che il gioco ricorda deve far parte dei dati esportati e importati da *Opzioni → Progressi*, cioè progressi generali e partita in corso. Vale per:
  - sblocchi di eroi, antagonisti, Saggio e Magor;
  - evoluzioni scoperte;
  - avanzamento della Campagna del Male;
  - compagni;
  - edizioni Gold e Silver;
  - record delle modalità;
  - Cronache dell'Era e Codex;
  - opzioni nuove;
  - primo piano guidato già visto;
  - partite in corso di entrambe le campagne.
- Niente nuovi spazi di salvataggio separati; se servissero, vanno aggiunti all'esportazione.
- **Compatibilità**: i file esportati con le versioni precedenti devono importarsi senza perdere nulla; i campi nuovi ricevono un valore iniziale e le partite in formato vecchio vengono convertite, non cancellate.
- **Grafica fedele ma nostra**: gli sprite sono **disegnati a mano in pixel art** guardando le illustrazioni delle carte e le statuine (forma, colori, armi, dettagli). Niente conversione automatica delle foto. Le immagini di riferimento restano **solo sul PC**, in una cartella esclusa dal repo, e non vengono pubblicate sul sito.
- **Verifica a fine fase**: mini-verifica nel simulatore; prove nel browser, compresa la prova esporta → cancella → importa e l'importazione di un file della versione precedente; commit "vX.Y.Z — …" (senza co-autore); push; controllo della versione online.

Dimensioni: **P** piccola · **M** media · **G** grande.

## Panoramica

| Fase | Versione | Nome | Contenuto | Dim. |
|---|---|---|---|---|
| 0 | 1.2.2 | Strumenti e archivio | Simulatore e mini-verifica nel repo; **archivio locale delle immagini** di tutte le linee dell'era | P |
| 1 | 1.3.0 | Coerenza con l'era | Occhio della Vita, nomi, testi, Tartantica, reliquie, sblocchi; il Saggio narratore | M |
| 2 | 1.4.0 | **I volti dell'era** | **Nuovi sprite e ritratti** fedeli alle carte per i 10 eroi, i boss che restano, il Saggio e Magor | G |
| 3 | 1.5.0 | Le regioni dell'era | Pianura delle Nebbie, Oscuro Orizzonte; boss Aracno, Lavion, Armageddon (sprite dai riferimenti) | G |
| 4 | 1.6.0 | Gli eserciti dell'era | 39 guerrieri del male come nemici e Campioni (sprite dai riferimenti) | G |
| 5 | 2.0.0 | Evoluzioni | Prima Serie → Mystica → Energheia; Seconda Serie → Atomic (aspetto dalle foto di quelle linee) | G |
| 6 | 2.1.0 | La Terza Serie | Antico Thorg, Grandalbero, Nobilmantis; Mythos → Final Evolution | G |
| 7 | 2.2.0 | Le battaglie della storia | Torneo dei Campioni, Il Grande Inganno, Valle del Destino, Porta Ultradimensionale | M |
| 8 | 2.3.0 | Compagni dei Popoli | Guerrieri buoni reclutabili (sprite dai riferimenti) | M |
| 9 | **3.0.0** | **Campagna del Male** | Antagonisti giocabili con evoluzioni; percorso invertito; Magor segreto | G |
| 10 | 3.1.0 | Modalità | Bolla Ultradimensionale, Torneo veloce, Cronache, edizioni Gold/Silver (dalle foto delle edizioni speciali) | M |
| 11 | 3.2.0 | Accoglienza | Primo piano guidato (Saggio/Magor), Cronache dell'Era, riepilogo della morte, daltonici, velocità, inglese | M |

---

## Fase 0 — Strumenti e archivio (v1.2.2) · P
- Cartella `tools/` con il simulatore, la batteria parallela e l'analisi; **mini-verifica** di 30 partite per eroe (~10 min).
- **Archivio di riferimento**: scarico le foto (statuina + carta) di tutte le linee dell'era (Prima Serie, Mystica, Seconda Serie, Atomic, Terza Serie, Mythos, Energheia, Final Evolution, edizioni Gold/Silver), con un indice per personaggio, linea e popolo. Va in una cartella locale **esclusa dal repo** (`.gitignore`).
- Dai testi delle carte ricavo un elenco di caratteristiche (armi, potenza, descrizione) per abilità e descrizioni fedeli.
- Nessuna modifica al gioco.

## Fase 1 — Coerenza con l'era (v1.3.0) · M
- Titolo **"GORMITI — L'Occhio della Vita"**: Magor frantuma l'Occhio della Vita e i Frammenti sono nelle mani dei Signori del male.
- Pietre → **Frammenti dell'Occhio della Vita**; valuta **"Schegge"**; "Frammento del Cuore di Gorm" → "Nucleo dell'Occhio della Vita".
- **Razzle** → **Tartantica la Veggente** (mercante, evento, reliquia, pacchetto del Santuario).
- Reliquie: "Corno di Cerbante" → "Pungiglione di Skorpios"; "Guscio di Crabs" → "Chela di Grankios".
- Via Crabs il Vendicatore e Mystral Corrotto; Orrore Profondo di elemento **Fuoco**.
- Sblocchi: Carrapax "Sconfiggi Orrore Profondo", Elios "Sconfiggi Devilfenix".
- Il Vecchio Saggio diventa la voce del gioco e resta giocabile; conversione dei salvataggi.

## Fase 2 — I volti dell'era (v1.4.0) · G
**Decisione da prendere a inizio fase:** dimensione degli sprite. Consigliato: **16×16 sulla mappa** (leggibilità del gioco a turni) più **ritratti dettagliati 48×48** per selezione, scheda dell'eroe, Codex e scene di evoluzione. In alternativa, 24×24 anche sulla mappa.
- Nuovi sprite fedeli alle carte per i **10 eroi attuali** (es. Gheos con il maglio chiodato).
- Nuovi sprite per i **boss che restano**: Orrore Profondo, Obscurio, Devilfenix, Magmion.
- **Vecchio Saggio** e **Magor** non hanno una statuina nell'era: disegno coerente con lo stile delle carte (e con eventuali illustrazioni dell'era, se ne trovo).
- Animazioni d'attacco aggiornate alle nuove armi e forme.

## Fase 3 — Le regioni dell'era (v1.5.0) · G

| Tappa | Regione | Boss | Novità |
|---|---|---|---|
| 1 | Foresta Silente | **Aracno il Crudele** (nuovo) | Ragnatele, veleno, cuccioli-ragno |
| 2a | Fossa degli Antichi Spiriti | Orrore Profondo | Abisso vulcanico sottomarino |
| 2b | **Pianura delle Nebbie** (nuova) | **Lavion il Signore del Terrore** (nuovo) | Nebbia che riduce la vista, colate di lava |
| 3 | Caverna di Roscamar | **Armageddon il Signore del Vulcano** (nuovo) | Forge, martelli, crolli |
| 4a | Picchi della Valle del Destino | Devilfenix | invariata |
| 4b | **Regione di Oscuro Orizzonte** (nuova) | **Obscurio** (spostato) | Porta Ultradimensionale, buio e luci |
| 5 | Monte Vulcano | Magmion il Signore del Male + Magor | invariata |

- Sprite e ritratti dei nuovi boss dai riferimenti.
- Spariscono Cerbante, Glaciator, Luxalion e i Ghiacciai (il ghiaccio che rallenta torna con Nobilmantis).
- Bilanciamento dei boss con i duelli da checkpoint.

## Fase 4 — Gli eserciti dell'era (v1.6.0) · G
- I **39 guerrieri del male dell'era** come nemici e Campioni, con **sprite dai riferimenti** e un comportamento legato al nome e al testo della carta.
- Poche creature maledette di contorno; Codex con popolo e serie di ogni nemico.

## Fase 5 — Evoluzioni (v2.0.0) · G

| Generazione | Eroi | 1ª evoluzione (dopo il 2° boss) | 2ª evoluzione (dopo il 4° boss) |
|---|---|---|---|
| Prima Serie | Gheos, Tasarau, Poivrons, Noctis | **Mystica** | **Energheia** |
| Seconda Serie | Kolossus, Barbataus, Carrapax, Elios | **Atomic** (più forte, per compensare) | — |
| Terza Serie | Sommo Luminescente (+ Fase 6) | **Mythos** | **Final Evolution** |
| Extra | Vecchio Saggio | *Risveglio dell'Occhio* | — |

- L'**aspetto delle forme evolute** viene dalle foto delle rispettive linee: Mystica con oro e argento, Atomic con le parti luminose e i colori mutanti, Energheia con la forma massiccia.
- Evolvendo: titolo nuovo, sprite e ritratto nuovi, passiva potenziata (scelta tra 2 varianti), Potere Supremo trasformato; scena del Saggio.
- **Elios e il Grande Inganno**: la Leggerezza Magica di Magor (traditore) oppure la mutazione del Saggio.

## Fase 6 — La Terza Serie (v2.1.0) · G
- Nuovi eroi dai riferimenti:
  - **L'Antico Thorg** (→ Diamante);
  - **Grandalbero** (→ Foresta Infuocata);
  - **Nobilmantis** (→ Ghiaccio, con il ghiaccio che rallenta i nemici).
- **Sommo Luminescente** → Popolo del Sole.
- Evoluzioni Mythos → Final Evolution con l'aspetto preso dalle foto di quelle linee.

## Fase 7 — Le battaglie della storia (v2.2.0) · M
- **Torneo dei Campioni**, **Il Grande Inganno**, **Battaglia della Valle del Destino**, **Porta Ultradimensionale**.

## Fase 8 — Compagni dei Popoli (v2.3.0) · M
- Guerrieri buoni dell'era reclutabili, con **sprite dai riferimenti**: serviranno anche come nemici nella Campagna del Male.
- Bonus se il compagno è del tuo popolo; comandi semplici.

## Fase 9 — Campagna del Male: gli antagonisti giocabili (v3.0.0) · G

| Antagonista | Serie | Evoluzioni |
|---|---|---|
| **Magmion il Signore del Male** | Prima | Mystica → Energheia |
| **Lavion il Signore del Terrore** | Prima | Mystica → Energheia |
| **Orrore Profondo** | Seconda | Atomic: **Combustione Atomica** |
| **Armageddon** | Terza | Mythos → **Signore del Metallo** |
| **Devilfenix** | Terza | Mythos → **Signore dei Fossili** |
| **Obscurio** | Terza | Mythos → **Signore della Luna** |

- **Elios il Grande Traditore** si sblocca anche qui, se accetti il dono di Magor.
- **Magor**: narratore della campagna e **personaggio segreto finale**, sbloccato vincendo la Campagna del Male e giocabile in entrambe le campagne. La sua evoluzione è la **Fusione con il Monte Vulcano**, presa da Atomic.
- **Percorso**: stesse regioni (mappe sempre generate a caso) in ordine invertito; nemici = guerrieri buoni, boss = Signori della Natura con le loro abilità, scelti a caso tra le generazioni.

| Tappa | Regione | Cosa succede | Boss |
|---|---|---|---|
| 1 | Monte Vulcano | L'assedio al Vulcano | un Signore della Terra (Gheos, Kolossus o Antico Thorg) |
| 2a | Picchi della Valle del Destino | Conquista delle terre dell'Aria | Noctis o Elios |
| 2b | Regione di Oscuro Orizzonte | La Luce ha invaso il regno delle Tenebre | Prismagon il Guerriero della Luce |
| 3 | Caverna di Roscamar | Conquista delle terre della Terra | un altro Signore della Terra |
| 4a | Fossa degli Antichi Spiriti | Conquista delle terre del Mare | Poivrons, Carrapax o Nobilmantis |
| 4b | Pianura delle Nebbie | Il grande campo di battaglia | l'alleanza dei Popoli |
| 5 | Foresta Silente | Il santuario dell'Occhio della Vita, difeso dai Signori della Foresta | **Vecchio Saggio + Sommo Luminescente** |

  **Decisione aperta (prima di questa fase):** il luogo dell'ultimo scontro, cioè il santuario dell'Occhio nella Foresta Silente (luogo inventato dentro una regione dell'era) oppure la **Pianura delle Nebbie** (battaglia finale della Final Evolution).
- Finali diversi; sblocchi degli antagonisti nella campagna dei buoni (es. "Sconfiggi Lavion 3 volte").
- Bilanciamento: i due schieramenti nella stessa fascia di vittorie.

## Fase 10 — Modalità (v3.1.0) · M
- **Bolla Ultradimensionale** senza fine (buoni e cattivi), **Torneo dei Campioni** veloce, **Cronache settimanali**.
- **Edizioni Gold e Silver**: colori alternativi sbloccabili, presi dalle foto delle edizioni speciali vere.

## Fase 11 — Accoglienza (v3.2.0) · M
- **Primo piano guidato**: dal Saggio per i buoni, da Magor per i cattivi.
- **Cronache dell'Era** nel Codex, **riepilogo della morte**, modalità per daltonici, velocità, inglese.
