A "Kétlépcsős" mentési folyamat a weboldalon:
Amikor a felhasználó (vagy te, mint admin) kitölti az "Új autó hozzáadása" űrlapot az oldalon, és kiválaszt 3 képet, a következő fog történni a háttérben:

Első lépés (Képek feltöltése): Az Angular weboldalad először csak a 3 képet küldi el a most megírt POST /api/uploads végpontnak. A backend elmenti őket a mappába, és visszaküld 3 új fájlnevet (pl. 1710...1.jpg, 1710...2.jpg, 1710...3.jpg).

Második lépés (Autó mentése): Az Angular megkapja ezeket a neveket, és beteszi őket a JSON objektumba (pontosan oda, ahova mi is írtuk kézzel Insomniában a POST /api/cars kérésnél). Végül elküldi a teljes autó-adatot a végpontnak, ami gyönyörűen elmenti az adatbázisba a fájlnevekkel együtt!



Képzeld el, mi történne, ha a weboldalad (Angular) küldené el az árat a backendnek, mondjuk így: "totalPrice": 75000.

Egy ügyeskedő felhasználó (vagy hacker) megnyithatná a böngésző fejlesztői eszközeit, átírhatná ezt a számot a küldés pillanatában, és elküldhetné a szervernek, hogy "totalPrice": 5. Ha a backend vakon elhinné, amit kap, akkor az illető 5 Forintért bérelné ki a Toyotát 5 napra!

Mivel viszont a mi backendünk csak az autó ID-ját fogadja el, és ő maga nézi meg az adatbázisban, hogy annak az autónak mennyi az ára, a rendszerünk 100%-ig biztonságos és átverhetetlen. Ezt hívják Server-Side Validation-nek (Szerver oldali hitelesítés).