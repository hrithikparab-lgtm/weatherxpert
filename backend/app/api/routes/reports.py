from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
import csv
import io

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.weather import WeatherObservation, WeatherStation

router = APIRouter()


@router.get("/export/csv")
async def export_csv(
    station_id: int = Query(...),
    start: datetime = Query(...),
    end: datetime = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export weather data as CSV — BRD Section 4.1 / 6"""
    result = await db.execute(
        select(WeatherObservation)
        .where(
            and_(
                WeatherObservation.station_id == station_id,
                WeatherObservation.observed_at >= start,
                WeatherObservation.observed_at <= end,
            )
        )
        .order_by(WeatherObservation.observed_at)
    )
    observations = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "Timestamp", "Temperature_C", "Humidity_pct", "WindSpeed_ms",
        "WindDir_deg", "Pressure_hPa", "Rainfall_mm", "CloudCover_pct",
        "GHI_Wm2", "DNI_Wm2", "DHI_Wm2", "QualityFlag"
    ])

    for o in observations:
        writer.writerow([
            o.observed_at.isoformat(),
            o.temperature, o.humidity, o.wind_speed,
            o.wind_direction, o.pressure, o.rainfall, o.cloud_cover,
            o.ghi, o.dni, o.dhi, o.quality_flag,
        ])

    output.seek(0)
    filename = f"weather_data_{station_id}_{start.date()}_{end.date()}.csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/summary")
async def get_report_summary(
    utility_id: int = Query(...),
    start: datetime = Query(...),
    end: datetime = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Summary statistics for a utility over a date range"""
    # Get all stations for utility
    stations_result = await db.execute(
        select(WeatherStation).where(WeatherStation.utility_id == utility_id)
    )
    stations = stations_result.scalars().all()
    station_ids = [s.id for s in stations]

    if not station_ids:
        return {"utility_id": utility_id, "stations": 0, "data_points": 0}

    obs_result = await db.execute(
        select(WeatherObservation).where(
            and_(
                WeatherObservation.station_id.in_(station_ids),
                WeatherObservation.observed_at >= start,
                WeatherObservation.observed_at <= end,
            )
        )
    )
    observations = obs_result.scalars().all()

    if not observations:
        return {"utility_id": utility_id, "stations": len(stations), "data_points": 0}

    temps = [o.temperature for o in observations if o.temperature is not None]
    winds = [o.wind_speed for o in observations if o.wind_speed is not None]
    rainfall = [o.rainfall for o in observations if o.rainfall is not None]

    return {
        "utility_id": utility_id,
        "stations": len(stations),
        "data_points": len(observations),
        "period": {"start": start.isoformat(), "end": end.isoformat()},
        "temperature": {
            "min": min(temps) if temps else None,
            "max": max(temps) if temps else None,
            "avg": round(sum(temps) / len(temps), 2) if temps else None,
        },
        "wind_speed": {
            "min": min(winds) if winds else None,
            "max": max(winds) if winds else None,
            "avg": round(sum(winds) / len(winds), 2) if winds else None,
        },
        "total_rainfall_mm": round(sum(rainfall), 2) if rainfall else None,
    }
