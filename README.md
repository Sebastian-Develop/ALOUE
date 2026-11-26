# ALOUÉ

Statische Shop-Vorschau für GitHub Pages mit 49 Produktvarianten. ALOUÉ-Preise und Bestände werden für den Shopify-Start festgelegt. Die Demo-Tasche speichert Größen und Mengen im Browser.

GitHub Pages baut die Kategorieseiten mit Jekyll. Der Vorschaukatalog und die Kategorien stehen in `shop-data.json`. Die Sammlungsvorlage `_shop-collection.html` wird von den Seiten `collection-*.html` unter `/collections/<handle>/` eingebunden. Für die lokale Vorschau `jekyll serve --baseurl /ALOUE` verwenden.

## Übernahme in ein Shopify-Theme

- Header, Kampagne, Kollektion, Kampagnenfilme, Editorial und Menswear sind eigenständige HTML-Bereiche und können als Liquid-Sections in ein Theme übernommen werden.
- CSS, Bilddateien und die Liquid-Glass-Module können als Theme-Assets geladen werden. Dateinamen und relative Modulverweise im Theme übernehmen oder über die Shopify-Asset-URLs auflösen.
- Den Vorschaukatalog mit Shopify-Kollektionen, Produktobjekten und Varianten verbinden. Suche und Warenkorb übernehmen die Funktionen des Ziel-Themes.
- Die Menswear-Links im Theme auf die jeweiligen Shopify-Kollektionen setzen. Die Vorschau nutzt eigene Seiten unter `/collections/` und zeigt einen Hinweis bei noch leeren Kategorien.
- Für einen Film einen `src` oder ein `<source src="…">` und das passende `poster` am jeweiligen Video ergänzen. In Shopify kann die Section dafür ein Video-Setting und den Liquid-Filter `video_tag` verwenden. Die Vorschau zeigt bei freien Plätzen ein Standbild.
- Für die Navigation `.masthead`, `.bar`, die Regeln für `.is-scrolled` und die Scroll-Logik aus `store.js` übernehmen. Chromium nutzt die SVG-Verschiebungskarte auf dem Live-Hintergrund. Browser ohne SVG-Backdrop, darunter Safari und Chrome auf dem iPhone, verwenden Glass SDK 0.0.3-beta.4 mit einem WebGL-Worker und einer auf ALOUÉ abgestimmten Kantenbrechung. Die Module `scene-refraction.js` und `campaign-refraction.js` übernehmen die Brechung auf älteren Geräten. Die Einstellung für reduzierte Transparenz gilt für alle Varianten.

[Shopify Theme-Architektur](https://shopify.dev/docs/storefronts/themes/architecture) · [Liquid Glass 0.3.0](https://www.npmjs.com/package/@dpawlikowski/liquid-glass/v/0.3.0) · [MIT-Lizenz](liquid-glass-license.txt) · [Glass SDK 0.0.3-beta.4](https://github.com/Glass-HQ/liquid-glass/releases/tag/liquid-glass%400.0.3-beta.4) · [MIT-Lizenz](glass-sdk-license.txt)

## Platzhalterbilder

Die integrierte ImageGen-Funktion erstellte das Kampagnenmotiv `campaign.jpg` und die Filmstandbilder.

- Kampagne: realistisches Herrenmode-Editorial mit zwei Models in anthrazit- und steinfarbener Kleidung vor warmer Betonarchitektur. Die linke Bildhälfte bleibt dunkel und ruhig für den separaten Seitentitel.
- Katalog: Die Produktfotos `produkt-*.jpg` stammen aus den zugeordneten Lieferantengalerien. In `shop-data.json` stehen bei Wendewesten und Wendejacken weitere Ansichten.
- Filmstandbilder: vier mit ImageGen erstellte Menswear-Aufnahmen in warmem Kalkstein, Ecru, Taupe und Anthrazit. Die Dateien `film-*.jpg` sind auf 9:16 zugeschnitten.
- `wordmark.png` ist die freigestellte Wortmarke aus dem von ALOUÉ bereitgestellten Originallogo.
