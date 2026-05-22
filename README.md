# Inventory Assistant

Webová aplikace pro inventarizaci IT zařízení. Umožňuje import zařízení z Excelu, skenování QR / čárových kódů v terénu a správu celého inventarizačního procesu.

---

## Spuštění (Docker)

### Požadavky
- Docker
- Docker Compose

### Instalace

1. Naklonuj repozitář:
   git clone <url>
   cd inventory-assistant

2. Spusť aplikaci:
   docker-compose up --build

3. Vytvoř admin účet:
   docker-compose exec app node prisma/seed.js

4. Otevři v prohlížeči:
   http://localhost:3000

---

## Přihlašovací údaje (výchozí)

| Email | Heslo | Role |
|-------|-------|------|
| admin@company.cz | admin123 | Admin |

---

## Role

| Role | Popis |
|------|-------|
| Admin | Import, správa inventur, správa uživatelů |
| User | Skenování zařízení v terénu |
| Manager | Přehledy a reporty za tým |

---

## Použití

### 1. Import zařízení
- Přihlas se jako Admin
- Jdi na **Import Excelu**
- Nahraj `.xlsx` soubor se strukturou:
  `Inv. číslo | Název | Sériové číslo | Uživatel | Tým | Lokalita`

### 2. Vytvoření inventury
- Jdi na **Správa inventur**
- Klikni na **Vytvořit**
- Inventura se automaticky aktivuje

### 3. Skenování (Fáze 1)
- Jdi na **Skenovat zařízení**
- Skenuj QR / čárový kód nebo zadej SN ručně
- Zařízení se označí jako FOUND nebo NEW

### 4. Kontrola (Fáze 2)
- Admin přepne inventuru na **Fázi 2**
- Každý uživatel vidí co mu ještě chybí najít
- Chybějící zařízení lze označit jako MISSING

### 5. Reporty
- Jdi na **Reporty**
- Zobrazí se celkový stav, přehledy per tým a per uživatel
- Export do CSV tlačítkem **Export CSV**

---

## Technologie

- Next.js 16
- Tailwind CSS
- Prisma ORM
- SQLite
- NextAuth.js
- Docker

---

## Záloha databáze

cp ./data/dev.db ./backups/dev_$(date +%Y%m%d).db

---

## Poznámky

- Aplikace běží pouze na interní síti (LAN/VPN)
- Skenování kamery vyžaduje HTTPS nebo localhost
- Výchozí port: 3000