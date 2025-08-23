# WeNotes Client

Frontend aplikacija za WeNotes platformu - sistem za upravljanje beleškama.

## Funkcionalnosti

- ✅ Autentifikacija i autorizacija (login/register)
- ✅ Dashboard sa grid layout-om za beleške
- ✅ Kreiranje, uređivanje i brisanje beleški
- ✅ Pin/unpin beleški
- ✅ Javne/privatne beleške
- ✅ Responsive dizajn
- ✅ Protected routes
- ✅ JWT token autentifikacija

## Tehnologije

- React 19
- TypeScript
- Tailwind CSS v4
- React Router DOM
- Axios
- JWT Decode

## Pokretanje

1. Instalirajte dependencies:
```bash
npm install
```

2. Kreirajte `.env` fajl u root direktorijumu:
```env
VITE_API_URL=http://localhost:3000/api
```

3. Pokrenite development server:
```bash
npm run dev
```

4. Otvorite [http://localhost:5173](http://localhost:5173) u browseru

## Struktura projekta

```
src/
├── components/          # Reusable komponente
│   ├── forms/          # Form komponente
│   ├── layout/         # Layout komponente
│   ├── notes/          # Note komponente
│   └── ui/             # UI komponente
├── context/            # React Context
├── pages/              # Stranice
├── routes/             # Routing
├── types/              # TypeScript tipovi
└── api/                # API klijent
```

## API Endpoints

- `POST /auth/login` - Prijava
- `POST /auth/register` - Registracija
- `GET /auth/me` - Dohvati trenutnog korisnika
- `GET /notes` - Dohvati sve beleške
- `POST /notes` - Kreiraj novu belešku
- `PUT /notes/:id` - Ažuriraj belešku
- `DELETE /notes/:id` - Obriši belešku

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```
