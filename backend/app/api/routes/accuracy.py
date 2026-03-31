from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta
import math

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.weather import WeatherObservation, WeatherForecast

router = APIRouter()


def calc_mae(pairs):
    if not pairs:
        return None
    return round(sum(abs(a - f) for a, f in pairs) / len(pairs), 3)


def calc_rmse(pairs):
    if not pairs:
        return None
    return round(math.sqrt(sum((a - f) ** 2 for a, f in pairs) / len(pairs)), 3)


def calc_mbe(pairs):
    if not pairs:
        return None
    return round(sum(a - f for a, f in pairs) / len(pairs), 3)


def calc_correlation(pairs):
    if len(pairs) < 2:
        return None
    n = len(pairs)
    actuals = [p[0] for p in pairs]
    forecasts = [p[1] for p in pairs]
    mean_a = sum(actuals) / n
    mean_f = sum(forecasts) / n
    num = sum((a - mean_a) * (f - mean_f) for a, f in zip(actuals, forecasts))
    den = math.sqrt(
        sum((a - mean_a) ** 2 for a in actuals)
        * sum((f - mean_f) ** 2 for f in forecasts)
    )
    return round(num / den, 4) if den != 0 else None


@router.get("/metrics")
async def get_accuracy_metrics(
    station_id: int = Query(...),
    provider: str = Query("imd"),
    parameter: str = Query("temperature"),
    start: datetime = Query(...),
    end: datetime = Query(...),
    resolution: str = Query("15min", description="15min|1hour|1day|1month|1year"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calculate MAE, RMSE, MBE, Correlation for forecast vs actual.
    BRD Section 4.5 — Accuracy Metrics.
    """
    # Fetch observations
    obs_result = await db.execute(
        select(WeatherObservation).where(
            and_(
                WeatherObservation.station_id == station_id,
                WeatherObservation.observed_at >= start,
                WeatherObservation.observed_at <= end,
            )
        )
    )
    observations = {o.observed_at: o for o in obs_result.scalars().all()}

    # Fetch forecasts
    fc_result = await db.execute(
        select(WeatherForecast).where(
            and_(
                WeatherForecast.station_id == station_id,
                WeatherForecast.provider == provider,
                WeatherForecast.forecast_for >= start,
                WeatherForecast.forecast_for <= end,
            )
        )
    )
    forecasts = {f.forecast_for: f for f in fc_result.scalars().all()}

    # Build pairs
    pairs = []
    for ts, obs in observations.items():
        if ts in forecasts:
            fc = forecasts[ts]
            actual_val = getattr(obs, parameter, None)
            forecast_val = getattr(fc, parameter, None)
            if actual_val is not None and forecast_val is not None:
                pairs.append((actual_val, forecast_val))

    if not pairs:
        # Return zeros if no matching data yet (works with mock until real data flows)
        return {
            "station_id": station_id,
            "provider": provider,
            "parameter": parameter,
            "resolution": resolution,
            "data_points": 0,
            "mae": None,
            "rmse": None,
            "mbe": None,
            "correlation": None,
            "message": "No matching forecast/observation pairs found",
        }

    return {
        "station_id": station_id,
        "provider": provider,
        "parameter": parameter,
        "resolution": resolution,
        "data_points": len(pairs),
        "mae": calc_mae(pairs),
        "rmse": calc_rmse(pairs),
        "mbe": calc_mbe(pairs),
        "correlation": calc_correlation(pairs),
    }


@router.get("/provider-comparison")
async def compare_providers(
    station_id: int = Query(...),
    parameter: str = Query("temperature"),
    start: datetime = Query(...),
    end: datetime = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Compare accuracy across all providers for a station"""
    providers = ["imd", "tomorrow_io"]
    results = []

    for provider in providers:
        fc_result = await db.execute(
            select(WeatherForecast).where(
                and_(
                    WeatherForecast.station_id == station_id,
                    WeatherForecast.provider == provider,
                    WeatherForecast.forecast_for >= start,
                    WeatherForecast.forecast_for <= end,
                )
            )
        )
        forecasts = {f.forecast_for: f for f in fc_result.scalars().all()}

        obs_result = await db.execute(
            select(WeatherObservation).where(
                and_(
                    WeatherObservation.station_id == station_id,
                    WeatherObservation.observed_at >= start,
                    WeatherObservation.observed_at <= end,
                )
            )
        )
        observations = {o.observed_at: o for o in obs_result.scalars().all()}

        pairs = []
        for ts, obs in observations.items():
            if ts in forecasts:
                a = getattr(obs, parameter, None)
                f = getattr(forecasts[ts], parameter, None)
                if a is not None and f is not None:
                    pairs.append((a, f))

        results.append({
            "provider": provider,
            "data_points": len(pairs),
            "mae": calc_mae(pairs),
            "rmse": calc_rmse(pairs),
            "mbe": calc_mbe(pairs),
            "correlation": calc_correlation(pairs),
        })

    return {"station_id": station_id, "parameter": parameter, "providers": results}
