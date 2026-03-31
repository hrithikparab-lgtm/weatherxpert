from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User, Utility
from app.models.weather import WeatherStation

router = APIRouter()


@router.get("/")
async def list_utilities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return utilities the current user has access to"""
    if current_user.role == "superadmin":
        result = await db.execute(select(Utility).where(Utility.is_active == True))
        utilities = result.scalars().all()
    else:
        result = await db.execute(
            select(Utility).where(
                Utility.id == current_user.utility_id,
                Utility.is_active == True,
            )
        )
        utilities = result.scalars().all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "short_name": u.short_name,
            "region": u.region,
            "type": u.type,
        }
        for u in utilities
    ]


@router.get("/{utility_id}/stations")
async def list_stations(
    utility_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return weather stations for a utility"""
    # Access check
    if current_user.role != "superadmin" and current_user.utility_id != utility_id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(WeatherStation).where(
            WeatherStation.utility_id == utility_id,
            WeatherStation.is_active == True,
        )
    )
    stations = result.scalars().all()
    return [
        {
            "id": s.id,
            "station_id": s.station_id,
            "name": s.name,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "type": s.station_type,
        }
        for s in stations
    ]
