
function About() {
  return (
    <div className={"content-container about-page " + (window.innerWidth > 500 ? "avoid-navbar" : "")}>
      <h2>Co je Afantázie?</h2>
      Afantázie postupně vzniká coby můj programovací projekt. Jejím prvním cílem je vytvořit grafové udělátko pro interakci s ostatními uživateli
      a jejich příspěvky, kterým říkám myšlenky.<br />
      <br />
      Myšlenky, stejně jako skoro všechny ostatní příspěvky na internetu, jsou jenom nějaký kus textu (časem i jiných typů médií),
      který nějak souvisí s jinými příspěvky. Na některé odpovídá, další zmiňuje a jiné zase odkazují na něj. Na Afantázii chci umět tyto vztahy zobrazit a umožnit
      jejich prozkoumávání.
      <h2>Podmínky používání a Zásady o ochraně osobních údajů</h2>
      Zatím jsem si nenaštudoval, co mě sem byrokracie nutí napsat...<br />
      Ale stručně a lidsky - registrací na této stránce:
      <ul>
        <li>Souhlasíš, že se tu budeš chovat slušně a svými příspěvky nebudeš porušovat zákony České Republiky</li>
        <li>Já se zavazuji, že se v rámci svých sil postarám o udržení Tvých údajů v bezpečí</li>
        <li>Data, která uchovávám jsou:
          <ul>
            <li>Uživatelské jméno</li>
            <li>Email</li>
            <li>Hash hesla</li>
            <li>Uživatelské nastavení (zvolená barva)</li>
            <li>Logy běžných technických dat nezbytně souvisejících s provozem stránky (IP adresa, typ prohlížeče, časy přístupů apod.)</li>
          </ul>
        </li>
      </ul>
      <h2>Cookies</h2>
      Až na funkční cookies pro přihlašování tu žádné nejsou. Jsi na tom posledním webu na světě, který tě nešmíruje.
    </div>
  )
}

export default About