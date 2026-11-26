# ALOUÉ

Statische Shop-Vorschau für GitHub Pages mit 49 Produktvarianten. ALOUÉ-Preise und Bestände werden für den Shopify-Start festgelegt. Die Demo-Tasche speichert Größen und Mengen im Browser.

GitHub Pages baut die Kategorieseiten mit Jekyll. Der Vorschaukatalog und die Kategorien stehen in `shop-data.json`. Die Sammlungsvorlage `_shop-collection.html` wird von den Seiten `collection-*.html` unter `/collections/<handle>/` eingebunden. Für die lokale Vorschau `jekyll serve --baseurl /ALOUE` verwenden.

## Übernahme in ein Shopify-Theme

- Header, Kampagne, Kollektion, Kampagnenfilme, Editorial und Menswear sind eigenständige HTML-Bereiche und können als Liquid-Sections in ein Theme übernommen werden.
- CSS, Bilddateien und die Liquid-Glass-Module können als Theme-Assets geladen werden. Dateinamen und relative Modulverweise im Theme übernehmen oder über die Shopify-Asset-URLs auflösen.
- Den Vorschaukatalog mit Shopify-Kollektionen, Produktobjekten und Varianten verbinden. Suche und Warenkorb übernehmen die Funktionen des Ziel-Themes.
- Die Menswear-Links im Theme auf die jeweiligen Shopify-Kollektionen setzen. In der Vorschau erscheinen Kollektionen mit Produkten. Frühere Links zu leeren Kollektionen leiten zu passenden Sortimentsseiten weiter.
- Das Outfit-Studio unter `#styling` verwendet denselben Katalog wie die Suche. Der Konfigurator besteht aus `_shop-outfits.html`, `outfit.css`, `outfit.js`, `outfit-preview.js`, den Modelporträts und den sieben `style-plate-*.jpg`. Für Shopify die Produktbilder, Varianten und Detailaktionen an den Shopify-Katalog anbinden.
- `shopify-bestseller.liquid` als `sections/aloue-bestseller.liquid` ins Ziel-Theme übernehmen und als Startseiten-Section hinzufügen. Eine nach „Bestseller“ sortierte Shopify-Kollektion auswählen. Die Section übernimmt deren erste drei Produkte. Das Label „Bestseller“ im Theme-Editor aktivieren, sobald Bestelldaten vorliegen. In der GitHub-Pages-Vorschau kommen die drei Karten aus den markierten `featured`-Produkten in `shop-data.json`.
- Kampagnenfilme als `films` in `shop-data.json` eintragen. Jeder Eintrag braucht `title` und `src` und kann ein `poster` haben. Mit dem ersten Film erscheinen der Bereich und die Navigationslinks. In Shopify kann die Section ein Video-Setting und den Liquid-Filter `video_tag` verwenden.
- Für die Navigation `.masthead`, `.bar`, die Regeln für `.is-scrolled` und die Scroll-Logik aus `store.js` übernehmen. Chromium nutzt die SVG-Verschiebungskarte auf dem Live-Hintergrund. Browser ohne SVG-Backdrop, darunter Safari und Chrome auf dem iPhone, verwenden Glass SDK 0.0.3-beta.4 mit einem WebGL-Worker und einer auf ALOUÉ abgestimmten Kantenbrechung. Die Module `scene-refraction.js` und `campaign-refraction.js` übernehmen die Brechung auf älteren Geräten. Die Einstellung für reduzierte Transparenz gilt für alle Varianten.

[Shopify Theme-Architektur](https://shopify.dev/docs/storefronts/themes/architecture) · [Liquid Glass 0.3.0](https://www.npmjs.com/package/@dpawlikowski/liquid-glass/v/0.3.0) · [MIT-Lizenz](liquid-glass-license.txt) · [Glass SDK 0.0.3-beta.4](https://github.com/Glass-HQ/liquid-glass/releases/tag/liquid-glass%400.0.3-beta.4) · [MIT-Lizenz](glass-sdk-license.txt)

## Kampagne und Produktfotos

- Kampagne: `campaign-aloue.jpg` ist eine ImageGen-Bearbeitung des vorhandenen Kampagnenmotivs. Die beiden bisherigen Models tragen Jacken, Baumwollshirts und Travelhosen nach Referenzen aus dem ALOUÉ-Katalog.
- Outfit-Studio: Die sieben ImageGen-Studioaufnahmen `style-plate-*.jpg` zeigen beide Models in verschiedenen Schnitten mit offenen Jacken und Westen. Die Vorschau passt die Farben am Modell anhand des ausgewählten Katalogartikels an und behält Licht, Schatten und Stofffalten der Aufnahme bei. Produktdetails verlinken auf die originalen Katalogfotos.
- Katalog: Die Produktfotos `produkt-*.jpg` stammen aus den zugeordneten Lieferantengalerien. In `shop-data.json` stehen bei Wendewesten und Wendejacken weitere Ansichten.
- `wordmark.png` ist die freigestellte Wortmarke aus dem von ALOUÉ bereitgestellten Originallogo.
