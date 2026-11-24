# ALOUÉ

Statische Shop-Vorschau für GitHub Pages. Die Produktdaten und Preise sind Beispiele. Die Demo-Tasche speichert Größen und Mengen im Browser.

## Übernahme in ein Shopify-Theme

- Header, Kampagne, Kollektion und Editorial sind eigenständige HTML-Bereiche. Sie können als Liquid-Sections in ein Theme übernommen werden.
- CSS, Bilddateien und die Liquid-Glass-Module können als Theme-Assets geladen werden. Dateinamen und relative Verweise der beiden Bibliotheksmodule beibehalten oder über die URL des Shopify-Assets auflösen.
- Platzhalterprodukte durch Shopify-Kollektionen, Produktobjekte und Varianten ersetzen und Suche sowie Warenkorb mit den Funktionen des Ziel-Themes verbinden.
- Für die Navigation die Klassen `.masthead` und `.bar`, die CSS-Regeln für `.is-scrolled` und die Scroll-Logik aus `store.js` übernehmen. Die eigene, abgerundete Verschiebungskarte in `nav-refraction.js` nutzt den SVG-Filter der mitgelieferten Bibliothek. Chrome und andere Chromium-Browser brechen damit den Live-Hintergrund. Andere Browser bekommen die CSS-Glasoberfläche. Die reduzierte Transparenz wird berücksichtigt. [Technischer Hintergrund](https://kube.io/blog/liquid-glass-css-svg/)

[Shopify Theme-Architektur](https://shopify.dev/docs/storefronts/themes/architecture) · [Liquid Glass 0.3.0](https://www.npmjs.com/package/@dpawlikowski/liquid-glass/v/0.3.0) · [MIT-Lizenz](liquid-glass-license.txt)

## Platzhalterbilder

Die integrierte ImageGen-Funktion erstellte das Kampagnenmotiv `campaign.jpg` und eine Katalogtafel, aus der die vier Produktbilder ausgeschnitten wurden.

- Kampagne: realistisches Herrenmode-Editorial mit zwei Models in anthrazit- und steinfarbener Kleidung vor warmer Betonarchitektur. Die linke Bildhälfte bleibt dunkel und ruhig für den separaten Seitentitel.
- Katalog: vier gleich große Studioaufnahmen auf creme-grauem Hintergrund. Anthrazitfarbenes Overshirt, ecrufarbener Feinstrick-Pullover, taupefarbene Bundfaltenhose und schwarzes Strickpolo.
- `wordmark.png` ist die freigestellte Wortmarke aus dem von ALOUÉ bereitgestellten Originallogo.
