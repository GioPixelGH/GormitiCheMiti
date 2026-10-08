# GORMITI — Le Pietre di Gorm

Un roguelike a turni ambientato sull'isola di Gorm. Scegli uno dei Signori della Natura e attraversa 5 regioni e 15 piani generati proceduralmente, fino al cuore del Monte Vulcano, dove ti aspetta Magor, il Signore del Male.

**▶ Gioca online: https://giopixelgh.github.io/GormitiCheMiti/** (PC, tablet e telefono, anche offline dopo la prima visita)

## Come si avvia

- **Online**: apri il link qui sopra. Da Chrome/Edge puoi anche installarlo come app (icona "Installa" nella barra degli indirizzi).
- **Doppio clic su `GIOCA.bat`**: apre il gioco in una finestra dedicata di Microsoft Edge.
- In alternativa, apri `index.html` con Edge, Chrome o Firefox.
- **App per Windows** (facoltativa): vedi [App desktop](#app-desktop).

Non serve installare nulla e non serve Internet. La partita si salva da sola all'inizio di ogni piano e quando chiudi la finestra. Puoi riprenderla con **Continua partita**.
Per lo schermo intero premi **F11** (o usa Opzioni → Schermo intero).

## Comandi

| Azione | Tasti |
|---|---|
| Muoversi / attaccare | `W A S D` o frecce · diagonali `Q E Z C` · tastierino numerico |
| Attendere un turno | `Spazio` |
| Esplorazione automatica | `X` |
| Abilità | `1` `2` `3` · Potere Supremo `4` (richiede la Furia piena) |
| Oggetti | `5` `6` `7` `8` `9` `0` · clic destro su un oggetto per gettarlo |
| Mira | `Tab` / frecce / mouse per scegliere, `Invio` o clic per confermare, `Esc` per annullare |
| Attraversare il portale | `Invio` (oppure clic sul portale) |
| Viaggiare | clic sinistro su una casella già esplorata |
| Scheda dell'eroe (build e Risonanze) | `I` |
| Guida · Menu · Musica · Zoom · Schermo intero | `H` · `Esc` · `M` · `+` / `-` o rotellina · `F11` |

Tutti i tasti si possono cambiare da **Opzioni → Comandi**.

**Touch (tablet e telefoni)**: compare una croce direzionale; un tocco su una casella ci viaggia (o attacca se c'è un nemico accanto), una pressione lunga mostra le informazioni sulla casella. Meglio giocare in orizzontale.

## Il gioco

- **10 eroi**: Gheos (Terra), Tasarau (Foresta), Poivrons (Mare), Noctis (Aria), più sei da sbloccare con le imprese:
  - il Vecchio Saggio — sconfiggi Obscurio
  - il Sommo Luminescente — vinci una partita
  - Kolossus, Campione della Terra — raggiungi il Monte Vulcano con Gheos
  - Carrapax, Campione del Mare — sconfiggi Glaciator
  - Elios, Campione dell'Aria — sconfiggi Luxalion Corrotto
  - Barbataus, Campione della Foresta — abbatti 250 nemici in totale

  Ognuno ha una passiva, 3 abilità, un Potere Supremo e potenziamenti dedicati.
- **7 regioni e bivi**: Foresta Silente → Fossa degli Antichi Spiriti *o* Ghiacciai Eterni → Caverna di Roscamar → Picchi della Valle del Destino *o* Tempio della Luce Infranta → Monte Vulcano. Dopo alcuni guardiani si aprono due portali e scegli tu la strada. Al primo piano di ogni regione c'è anche un **Portale Cremisi**: il Sentiero Pericoloso, con più nemici e tesori migliori.
- **8 boss** con più fasi e attacchi annunciati: Cerbante, l'Orrore Profondo, Glaciator, Obscurio, Devilfenix, Luxalion Corrotto, Magmion e Magor.
- **Nemici più tattici**: oltre 50 tipi di nemici, gruppi che si aiutano tra loro, varianti con modificatori (Corazzato, Rapido, Furioso, Vampirico, Esplosivo, Gelido, Dorato, Spinoso) e **Campioni** con un nome proprio e un premio.
- **Risonanze**: ogni reliquia e ogni Dono ha un'affinità (Veleno, Fuoco, Critico, Vita, Difesa, Furia, Tempesta, Saggezza, Fortuna). Con 2 elementi della stessa affinità si attiva un bonus, con 4 un potere che cambia il modo di giocare.
- **Eventi**: cippi luminosi con piccole storie e scelte da ponderare (Razzle nei guai, lo Specchio di Obscurio, la Forgia Antica, l'indovinello del Saggio e altri: 15 in tutto).
- **Segreti**: i muri incrinati si abbattono e nascondono tesori.
- **Crescita**: a ogni livello scegli un Dono del Saggio (77 potenziamenti). In più ci sono 51 reliquie, 13 consumabili, mercanti, santuari e trappole.
- **Santuario del Saggio**: a fine partita guadagni Essenza, da spendere soprattutto per rendere i viaggi successivi più *vari* (nuove reliquie ed eventi nel bottino), più qualche piccola comodità di partenza. Niente potenziamenti permanenti alle statistiche.
- **Rigiocabilità**: mappe sempre diverse, Sfida del giorno con seme condiviso, 5 livelli di Eclissi (difficoltà), Codex con bestiario, reliquie, imprese e cronache delle partite.
- **Elementi**: Mare ▶ Fuoco ▶ Foresta ▶ Terra ▶ Aria ▶ Mare. Ogni elemento infligge ×1,5 danni a quello che segue.

## Progressi

I progressi (eroi sbloccati, Essenza, Codex, opzioni) e la partita in corso sono salvati nel browser. Da **Opzioni → Progressi** puoi **esportarli** in un file `.json` e **importarli** altrove: utile per passare dal browser all'app desktop o a un altro computer.

## App desktop

Nella cartella `desktop/` c'è un piccolo launcher per Windows (WinForms + WebView2, il motore di Edge) che apre il gioco in una finestra propria con icona, senza barre del browser.

```powershell
powershell -ExecutionPolicy Bypass -File desktop\build.ps1
```

Lo script usa il compilatore C# già incluso in Windows, scarica una sola volta il pacchetto NuGet `Microsoft.Web.WebView2` e crea:

- `dist\Gormiti\Gormiti.exe` con i file del gioco in `dist\Gormiti\game\`
- `dist\Gormiti-Windows.zip`, pronto da copiare su un altro PC

Serve il *Microsoft Edge WebView2 Runtime* (già presente su Windows 10/11 aggiornati; se manca, l'app propone il download o di giocare nel browser). I salvataggi dell'app sono separati da quelli del browser: usa Esporta/Importa per trasferirli. Con `Gormiti.exe --dev` si abilitano gli strumenti per sviluppatori.

## Versione web / PWA

Il gioco è pubblicato con GitHub Pages ed è una PWA: dal sito `https` si può installare come app da Chrome/Edge su PC e Android e funziona offline grazie al service worker (`sw.js`, `manifest.webmanifest`). Aperto come file locale (`file://`) funziona normalmente, solo senza installazione. I salvataggi della versione online sono separati da quelli della versione locale: per spostarli usa Esporta/Importa.

> **Nota**: Gormiti è un marchio registrato di Giochi Preziosi. Questo è un fan game gratuito, non ufficiale e senza scopo di lucro; se i titolari dei diritti lo chiedono, verrà rimosso.

## Consigli

- I PV non si rigenerano da soli: le pozioni sono preziose.
- Colpisci i nemici addormentati (zZ) per un critico garantito.
- Le caselle con il bordo rosso annunciano un attacco potente: spostati!
- Spingi i nemici nella lava, nei baratri o contro i muri. Sul ghiaccio si scivola: vale anche per loro.
- Passa il mouse (o tieni premuto) su un nemico per vedere elemento, statistiche e debolezze.
- Premi `I` per controllare le Risonanze: due reliquie della stessa affinità valgono più di una reliquia rara isolata.

## Crediti

- Gioco, codice, grafica pixel-art procedurale, effetti sonori e musica sintetizzata: creati appositamente per questo progetto.
- Font: *Press Start 2P* (CodeMan38) e *VT323* (Peter Hull), con licenza SIL Open Font License 1.1 (vedi `assets/fonts`).
- Fan game non ufficiale e senza scopo di lucro. Gormiti è un marchio di Giochi Preziosi; nomi e ambientazione sono usati a titolo di omaggio.
