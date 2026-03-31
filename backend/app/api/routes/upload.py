from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import csv
import io

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User
from app.models.weather import WeatherObservation

router = APIRouter()


@router.post("/csv")
async def upload_csv(
    file: UploadFile = File(...),
    station_id: int = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin"))(),
):
    """
    Upload weather observation CSV.
    Expected columns: Timestamp, Temperature_C, Humidity_pct,
    WindSpeed_ms, WindDir_deg, Pressure_hPa, Rainfall_mm, GHI_Wm2
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files supported")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    inserted = 0
    errors = []

    for i, row in enumerate(reader, 1):
        try:
            ts_raw = row.get("Timestamp") or row.get("timestamp") or row.get("Date_Time")
            if not ts_raw:
                errors.append(f"Row {i}: missing timestamp")
                continue

            obs = WeatherObservation(
                station_id=station_id,
                observed_at=datetime.fromisoformat(ts_raw.replace(" ", "T")),
                temperature=_float(row.get("Temperature_C") or row.get("Temp")),
                humidity=_float(row.get("Humidity_pct") or row.get("RH")),
                wind_speed=_float(row.get("WindSpeed_ms") or row.get("WS")),
                wind_direction=_float(row.get("WindDir_deg") or row.get("WD")),
                pressure=_float(row.get("Pressure_hPa") or row.get("Press")),
                rainfall=_float(row.get("Rainfall_mm") or row.get("Rain")),
                ghi=_float(row.get("GHI_Wm2") or row.get("GHI")),
                quality_flag=row.get("QualityFlag", "good"),
            )
            db.add(obs)
            inserted += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    if inserted > 0:
        await db.commit()

    return {
        "inserted": inserted,
        "errors": errors[:20],  # return first 20 errors max
        "total_errors": len(errors),
    }


def _float(val):
    if val is None or val == "" or val == "null":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None
