"""
Seed script — run once to populate utilities, stations, and a superadmin user.
Usage: python seed.py
"""
import asyncio
from app.core.database import AsyncSessionLocal, create_tables
from app.core.security import hash_password
from app.models.user import User, Utility
from app.models.weather import WeatherStation


UTILITIES = [
    {"name": "Mumbai Distribution", "short_name": "MDIST", "region": "Maharashtra", "type": "distribution"},
    {"name": "Delhi Distribution", "short_name": "DDIST", "region": "Delhi NCR", "type": "distribution"},
    {"name": "Renewables - Solar", "short_name": "SOLAR", "region": "Rajasthan", "type": "solar"},
    {"name": "Renewables - Wind", "short_name": "WIND", "region": "Gujarat", "type": "wind"},
    {"name": "Mundra UMPP", "short_name": "MUNDRA", "region": "Gujarat", "type": "distribution"},
    {"name": "Maithon Power", "short_name": "MAITH", "region": "Jharkhand", "type": "distribution"},
]

STATIONS = [
    # Mumbai Distribution
    {"station_id": "MUM-COL-001", "name": "Colaba AWS", "utility": "Mumbai Distribution", "lat": 18.9088, "lon": 72.8158, "type": "aws"},
    {"station_id": "MUM-BAN-001", "name": "Bandra Grid Station AWS", "utility": "Mumbai Distribution", "lat": 19.0596, "lon": 72.8295, "type": "aws"},
    {"station_id": "MUM-ANH-001", "name": "Andheri Substation AWS", "utility": "Mumbai Distribution", "lat": 19.1136, "lon": 72.8697, "type": "aws"},
    {"station_id": "MUM-THN-001", "name": "Thane Industrial AWS", "utility": "Mumbai Distribution", "lat": 19.2183, "lon": 72.9781, "type": "aws"},
    # Delhi Distribution
    {"station_id": "DEL-CPL-001", "name": "Connaught Place AWS", "utility": "Delhi Distribution", "lat": 28.6315, "lon": 77.2167, "type": "aws"},
    {"station_id": "DEL-DWK-001", "name": "Dwarka AWS", "utility": "Delhi Distribution", "lat": 28.5921, "lon": 77.0460, "type": "aws"},
    # Solar
    {"station_id": "SOL-JAI-001", "name": "Jaisalmer Solar Park", "utility": "Renewables - Solar", "lat": 26.9157, "lon": 70.9083, "type": "solar"},
    {"station_id": "SOL-CHA-001", "name": "Charanka Solar Park", "utility": "Renewables - Solar", "lat": 23.8800, "lon": 71.1700, "type": "solar"},
    # Wind
    {"station_id": "WND-KCH-001", "name": "Kutch Wind Farm", "utility": "Renewables - Wind", "lat": 23.7337, "lon": 69.8597, "type": "wind"},
    {"station_id": "WND-JAI-001", "name": "Jaisalmer Wind Park", "utility": "Renewables - Wind", "lat": 27.0360, "lon": 70.8740, "type": "wind"},
]


async def seed():
    await create_tables()

    async with AsyncSessionLocal() as db:
        # Create utilities
        utility_map = {}
        for u_data in UTILITIES:
            u = Utility(**u_data)
            db.add(u)
            await db.flush()
            utility_map[u_data["name"]] = u.id

        # Create stations
        for s_data in STATIONS:
            utility_id = utility_map[s_data["utility"]]
            s = WeatherStation(
                station_id=s_data["station_id"],
                name=s_data["name"],
                utility_id=utility_id,
                latitude=s_data["lat"],
                longitude=s_data["lon"],
                station_type=s_data["type"],
            )
            db.add(s)

        # Create superadmin user
        superadmin = User(
            name="Rajesh Kumar",
            email="rajesh.k@tatapower.com",
            hashed_password=hash_password("Admin@1234"),
            role="superadmin",
            utility_id=None,
        )
        db.add(superadmin)

        # Create one admin per main utility
        admins = [
            ("Priya Sharma", "priya.s@tatapower.com", "Mumbai Distribution"),
            ("Vikram Rao", "vikram.r@tatapower.com", "Delhi Distribution"),
        ]
        for name, email, utility in admins:
            admin = User(
                name=name,
                email=email,
                hashed_password=hash_password("Admin@1234"),
                role="admin",
                utility_id=utility_map[utility],
            )
            db.add(admin)

        await db.commit()
        print("✅ Seed complete!")
        print("Superadmin: rajesh.k@tatapower.com / Admin@1234")


if __name__ == "__main__":
    asyncio.run(seed())
