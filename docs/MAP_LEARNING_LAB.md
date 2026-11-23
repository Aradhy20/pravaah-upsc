# PRAVAAH UPSC — MAP-BASED LEARNING LAB

**Route:** `/map-lab`  
**API Endpoint:** `/api/v1/map-lab`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Database Model:** `MapFeature` (Prisma PostgreSQL)

---

## 1. Pedagogical Imperative: Geography & Spatial Memory

Spatial geography questions constitute between **8 and 14 questions (16 to 28 marks)** in every UPSC Prelims GS Paper I. UPSC frequently tests:
- Protected Areas (National Parks, Tiger Reserves, Biosphere Reserves, Ramsar Wetlands).
- Drainage systems, waterfalls, mountain passes, and river confluences.
- Geopolitical chokepoints, straits, inland seas, and conflict zones (e.g., Red Sea, Bab-el-Mandeb, Strait of Hormuz).

The **Map-Based Learning Lab** bridges cartographic visualization with authentic examination practice.

---

## 2. Database Schema & Seeded Content

The platform maintains verified geographic entities in the `MapFeature` table with verified WGS84 coordinates, administrative regions, and UPSC PYQ linkages:

### Verified Initial Seed Records:
1. **Keibul Lamjao National Park** (`24.5000° N, 93.8500° E`) — *Manipur*  
   - World's only floating national park on Loktak Lake (*phumdis*); habitat of Sangai deer (PYQ 2015, 2019, 2024).
2. **Namdapha National Park** (`27.4965° N, 96.3883° E`) — *Arunachal Pradesh*  
   - Famous for four big cat species; altitudinal transition from tropical to alpine (PYQ 2013, 2023).
3. **Dhuandhar Falls** (`23.1308° N, 79.8080° E`) — *Narmada River, Jabalpur, Madhya Pradesh*  
   - Gorge of marble rocks (PYQ 2024 GS1 Q12 verified key).
4. **Hundru Falls** (`23.4542° N, 85.6540° E`) — *Subarnarekha River, Ranchi, Jharkhand*  
   - Chota Nagpur Plateau (PYQ 2024 GS1 Q12 verified key).
5. **Gersoppa (Jog) Falls** (`14.2281° N, 74.8122° E`) — *Sharavati River, Western Ghats, Karnataka*  
   - Highest untiered waterfall (PYQ 2024 GS1 Q12 verified key).
6. **Bab-el-Mandeb Strait** (`12.5833° N, 43.3333° E`) — *Red Sea & Gulf of Aden*  
   - Strategic chokepoint between Yemen, Djibouti, and Eritrea (PYQ 2024, 2022).
7. **Strait of Hormuz** (`26.5667° N, 56.2500° E`) — *Persian Gulf & Gulf of Oman*  
   - Vital petroleum maritime route between Iran and Oman.
8. **Agasthyamala Biosphere Reserve** (`8.6500° N, 77.2500° E`) — *Western Ghats (Kerala & Tamil Nadu)*  
   - Home to the Kanikkar tribe (PYQ 2019).
9. **Pulicat Lake & Bird Sanctuary** (`13.6667° N, 80.2000° E`) — *Andhra Pradesh & Tamil Nadu*  
   - Second largest brackish water lagoon in India; separated from Bay of Bengal by Sriharikota barrier island.
10. **Zoji La Pass** (`34.2800° N, 75.5100° E`) — *Great Himalayan Range, Ladakh / Jammu & Kashmir*  
    - Connects Srinagar to Leh; high strategic pass.

---

## 3. Dual-Mode Interface Architecture

The `/map-lab` application interface offers two integrated learning modes:

### Mode 1: Spatial Atlas Explorer (स्थानिक एटलस)
- Category filter buttons: `All`, `National Parks`, `Waterfalls`, `Straits`, `Biosphere Reserves`, `Lakes`, `Passes`.
- Visual cards displaying:
  - English & Hindi verified names.
  - Coordinate badge (`Latitude / Longitude`).
  - Region / State badge.
  - High-yield exam significance note.
  - Historical UPSC Prelims years where this location was directly tested.

### Mode 2: Interactive Map Quiz Mode (मानचित्र प्रश्नोत्तरी)
- Presents a blind geographic challenge (e.g., *"Which of the following rivers forms the Hundru Falls on the Chota Nagpur Plateau?"*).
- Options with instant visual feedback and geographical context.
- Accuracy telemetry synchronized with the student's Geography subject profile.
