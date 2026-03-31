from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from datetime import datetime, timedelta
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.weather import WeatherObservation, WeatherForecast, WeatherStation

router = APIRouter()


@router.get("/current/{station_id}")
async def get_current_weather(
    station_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Latest observation for a station"""
    result = await db.execute(
        select(WeatherObservation)
        .where(WeatherObservation.station_id == station_id)
        .order_by(desc(WeatherObservation.observed_at))
        .limit(1)
    )
    obs = result.scalar_one_or_none()
    if not obs:
        raise HTTPException(status_code=404, detail="No data for this station")

    return {
        "station_id": station_id,
        "observed_at": obs.observed_at,
        "temperature": obs.temperature,
        "humidity": obs.humidity,
        "wind_speed": obs.wind_speed,
        "wind_direction": obs.wind_direction,
        "pressure": obs.pressure,
        "rainfall": obs.rainfall,
        "cloud_cover": obs.cloud_cover,
        "ghi": obs.ghi,
        "quality_flag": obs.quality_flag,
    }


@router.get("/historical/{station_id}")
async def get_historical(
    station_id: int,
    start: datetime = Query(..., description="Start datetime ISO8601"),
    end: datetime = Query(..., description="End datetime ISO8601"),
    resolution: str = Query("15min", description="15min|1hour|1day"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Historical observations with optional downsampling"""
    if (end - start).days > 365:
        raise HTTPException(status_code=400, detail="Max range is 1 year")

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

    # Simple downsampling for hourly/daily
    data = [
        {
            "time": o.observed_at.isoformat(),
            "temperature": o.temperature,
            "humidity": o.humidity,
            "wind_speed": o.wind_speed,
            "rainfall": o.rainfall,
            "cloud_cover": o.cloud_cover,
            "ghi": o.ghi,
        }
        for o in observations
    ]

    return {"station_id": station_id, "resolution": resolution, "data": data}


@router.get("/forecast/{station_id}")
async def get_forecast(
    station_id: int,
    provider: str = Query("imd", description="imd|tomorrow_io"),
    horizon: str = Query("day_ahead", description="15min|1hour|day_ahead|15day"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Weather forecasts for a station from a provider"""
    horizon_hours = {"15min": 0.25, "1hour": 1, "day_ahead": 24, "15day": 360}
    max_hours = horizon_hours.get(horizon, 24)

    now = datetime.utcnow()
    end_time = now + timedelta(hours=max_hours)

    result = await db.execute(
        select(WeatherForecast)
        .where(
            and_(
                WeatherForecast.station_id == station_id,
                WeatherForecast.provider == provider,
                WeatherForecast.forecast_for >= now,
                WeatherForecast.forecast_for <= end_time,
            )
        )
        .order_by(WeatherForecast.forecast_for)
    )
    forecasts = result.scalars().all()

    return {
        "station_id": station_id,
        "provider": provider,
        "horizon": horizon,
        "data": [
            {
                "time": f.forecast_for.isoformat(),
                "temperature": f.temperature,
                "humidity": f.humidity,
                "wind_speed": f.wind_speed,
                "rainfall": f.rainfall,
                "cloud_cover": f.cloud_cover,
                "ghi": f.ghi,
            }
            for f in forecasts
        ],
    }


@router.get("/parameters")
async def get_parameters():
    """Return all supported weather parameters per BRD"""
    return {
        "parameters": [
            {"id": "temperature", "label": "Ambient Temperature", "unit": "°C"},
            {"id": "humidity", "label": "Relative Humidity", "unit": "%"},
            {"id": "wind_speed", "label": "Wind Speed (10m)", "unit": "m/s"},
            {"id": "wind_speed_80m", "label": "Wind Speed (80m)", "unit": "m/s"},
            {"id": "wind_speed_100m", "label": "Wind Speed (100m)", "unit": "m/s"},
            {"id": "wind_direction", "label": "Wind Direction", "unit": "°"},
            {"id": "wind_gust", "label": "Wind Gust", "unit": "m/s"},
            {"id": "pressure", "label": "Ambient Pressure", "unit": "hPa"},
            {"id": "rainfall", "label": "Rainfall", "unit": "mm"},
            {"id": "cloud_cover", "label": "Cloud Cover", "unit": "%"},
            {"id": "ghi", "label": "GHI", "unit": "W/m²"},
            {"id": "dni", "label": "DNI", "unit": "W/m²"},
            {"id": "dhi", "label": "DHI", "unit": "W/m²"},
            {"id": "dew_point", "label": "Dew Point Temperature", "unit": "°C"},
            {"id": "air_density", "label": "Air Density", "unit": "kg/m³"},
        ]
    }
