Beüzemelési útmutató

------------------------------------------------------------------------------

A futtatáshoz szükséged lesz a következőkre:
- Node.js (v18 vagy újabb ajánlott)
- npm csomagkezelő
- Git

------------------------------------------------------------------------------

FONTOS: Mivel az adatbázis teljesen üres, így az admin felülethez nincs fiók.
        Ha használni szeretnéd, hozz létre egyet.
Insomnia vagy Postman használata esetén példa:
1. Állítsd a metódust POST-ra
2. URL: http://localhost:5000/api/users
3. Válaszd a Body -> raw -> JSON opciót
4. Másold be ezt:
{
  "username": "felhasznalonev",
  "password": "jelszo",
  "name": "Felhasználó Ferenc",
  "role": "superadmin"
}

(Az admin felületet itt éred el: http://localhost:4200/admin/login)

------------------------------------------------------------------------------

1. A projekt letöltése
git clone https://github.com/nagy-imre/autoexpert
cd autoexpert

2. Backend beállítása
cd autokereskedes-backend
npm install
 
2.1. Hozd létre a környezeti fájlt (.env) a template alapján (a backend mappában)

3. Frontend beállítása
Lépj bele a frontend mappába
ng serve --open

4. Backend indítása
Lépj bele a backend mappába
npm start

------------------------------------------------------------------------------

TLDR:
git clone https://github.com/nagy-imre/autoexpert

Backend:
cd autoexpert
cd autokereskedes-backend
npm install
npm start

Frontend:
cd autoexpert
cd autokereskedes-frontend
ng serve --open