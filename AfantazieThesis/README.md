# Šablona pro sazbu závěrečných prací na MFF UK v LaTeXu

## Úvod

Toto je šablona pro sazbu bakalářských, diplomových, dizertačních
a rigorozních prací na MFF UK v LaTeXu.

Povinné náležitosti úpravy závěrečných prací jsou dány opatřeními děkana
č. [26/2023](https://www.mff.cuni.cz/cs/vnitrni-zalezitosti/predpisy/opatreni-dekana/opatreni-dekana-c-26-2023)
a [27/2023](https://www.mff.cuni.cz/cs/vnitrni-zalezitosti/predpisy/opatreni-dekana/opatreni-dekana-c-27-2023)
a opatřením rektora č. [72/2017](https://cuni.cz/UK-8701.html).
Mimo to existují ještě další doporučení -- ta najdete v
[ukázkové úpravě](https://www.mff.cuni.cz/cs/studenti/sablony-studentskych-praci).
Tento formát pro LaTeX se jimi řídí a snaží se důležité věci připomínat
komentáři. Přesto si raději celá pravidla přečtěte.

## Jak šablonu použít

Základní údaje o práci vyplňte v souboru `metadata.tex`. Odtamtud se automaticky
vloží na ostatní místa.

Hlavním souborem práce je `thesis.tex`. Tam najdete nejen nastavení LaTeXu
(balíčky apod.), ale také příkazy pro vložení souborů s jednotlivými částmi
práce.

Kromě toho můžete přeložením `abstract-cs.tex` a `abstract-en.tex` získat
PDF se samostatným abstraktem práce, které se spolu s prací odevzdává do SISu.

Pokud LaTeX ještě neznáte, na webu naleznete mnoho úvodních textů.
Nám se nejvíce osvědčil [návod z Wikibooks](http://en.wikibooks.org/wiki/LaTeX).

Česká verze šablony obsahuje komentáře a ukázkové kapitoly s popisem doporučené
úpravy a různými radami pro sazbu v TeXu.

## Jaká je vhodná verze TeXu

Doporučujeme instalaci TeXlive ve verzi alespoň 2020. Starší verze TeXlive
a všechny známé verze MikTeXu jsou problematické. Také je potřeba nainstalovat
program `biber` pro zpracování bibliografie a pokud možno také `latexmk`;
obojí je součástí TeXlive.

Práci doporučujeme překládat pomocí `latexmk`, na UNIXových systémech stačí
pomocí `make` spustit přiložený `Makefile`. Pokud vaše instalace TeXu neobsahuje
LuaTeX, zařiďte se podle komentáře v souboru `.latexmkrc`.

Elektronická podoba práce, kterou odevzdáváte do SISu, musí být povinně
ve formátu PDF/A-1a nebo -2u. Tato šablona vytváří PDF/A-2u pomocí balíčku
[pdfx](https://www.ctan.org/tex-archive/macros/latex/contrib/pdfx). Kdyby
byl ve vaší instalaci TeXu tento balíček zastaralý nebo nefunkční, stáhněte
si ho raději samostatně a rozbalte do adresáře `tex/pdfx/`.

### Overleaf

Matfyz má pro zaměstnance i studenty k dispozici profesionální licenci
k Overleafu, což je editor TeXu běžící ve webovém prohlížeči. Pokud vás takový
nástroj láká, přečtěte si
[fakultní návod](https://www.mff.cuni.cz/cs/vnitrni-zalezitosti/it-a-sluzby/cloudove-sluzby/overleaf-na-mff-uk).

Šablona v Overleafu funguje, jen je  potřeba v nastaveních projektu zvolit main
document `thesis.tex` a compiler `LuaLaTeX`.

## Autoři

Hlavními autory šablony jsou:

- [Martin Mareš](https://mj.ucw.cz/) (<mj@ucw.cz>) -- současný správce šablony
- Arnošt Komárek (<komarek@karlin.mff.cuni.cz>)
- Michal Kulich (<kulich@karlin.mff.cuni.cz>)

Také jsme čerpali inspiraci z alternativní šablony [better-thesis](https://github.com/exaexa/better-mff-thesis),
na níž se podíleli zejména:

- Vít Kabele
- Mirek Kratochvíl
- Jan Joneš
- Gabriela Suchopárová
- Evžen Wybitul

## Licence

Všechny součásti šablony je možné volně používat a šířit podle licence
[Creative Commons CC-0](https://creativecommons.org/public-domain/cc0/).

Výjimkou jsou fakultní loga v adresáři `img`, jejichž použití se řídí směrnicí
děkana č. 5/2016 a souvisejícími předpisy.

## Odkazy

Aktuální verzi šablony najdete v projektech
[thesis-cs](https://gitlab.mff.cuni.cz/teaching/thesis-templates/thesis-cs) a
[thesis-en](https://gitlab.mff.cuni.cz/teaching/thesis-templates/thesis-en)
na fakultním GitLabu.

Pokud máte jakékoliv připomínky nebo návrhy na vylepšení, dejte prosím vědět.
Ideálně je založte jako issues v projektu thesis-en.

Další instrukce k přípravě PDF/A naleznete v ukázkových kapitolách
a v [PDF/A FAQ](https://mj.ucw.cz/vyuka/bc/pdfaq.html).

Také udržujeme [sbírku materiálů](https://mj.ucw.cz/vyuka/bc/) o psaní
závěrečných prací a odborných textů vůbec.
