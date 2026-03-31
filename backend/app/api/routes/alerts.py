from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, update
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User
from app.models.alert import Alert, AlertRule

router = APIRouter()


class CreateAlertRuleRequest(BaseModel):
    name: str
    utility_id: int
    parameter: str
    operator: str          # gt | lt | gte | lte | between
    threshold_value: float
    threshold_value_2: Optional[float] = None
    time_horizon: str = "realtime"
    severity: str = "warning"
    location_scope: str = "all"
    station_ids: List[int] = []


class CreateAlertRequest(BaseModel):
    utility_id: int
    title: str
    description: Optional[str] = None
    parameter: str
    severity: str
    actual_value: Optional[float] = None
    threshold_value: Optional[float] = None
    unit: Optional[str] = None
    station_id: Optional[int] = None
    is_internal: bool = True


@router.get("/")
async def list_alerts(
    utility_id: Optional[int] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List alerts — filtered by utility based on user role"""
    q = select(Alert).order_by(desc(Alert.triggered_at)).limit(limit)

    filters = []
    # Role-based filtering
    if current_user.role != "superadmin":
        filters.append(Alert.utility_id == current_user.utility_id)
    elif utility_id:
        filters.append(Alert.utility_id == utility_id)

    if severity:
        filters.append(Alert.severity == severity)
    if status:
        filters.append(Alert.status == status)

    if filters:
        q = q.where(and_(*filters))

    result = await db.execute(q)
    alerts = result.scalars().all()

    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "parameter": a.parameter,
            "severity": a.severity,
            "status": a.status,
            "provider": a.provider,
            "actual_value": a.actual_value,
            "threshold_value": a.threshold_value,
            "unit": a.unit,
            "triggered_at": a.triggered_at,
            "resolved_at": a.resolved_at,
            "sla_minutes": a.sla_minutes,
            "escalation_level": a.escalation_level,
            "utility_id": a.utility_id,
            "station_id": a.station_id,
        }
        for a in alerts
    ]


@router.post("/")
async def create_alert(
    body: CreateAlertRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a manual / internal alert"""
    if current_user.role == "operator" and current_user.utility_id != body.utility_id:
        raise HTTPException(403, "Operators can only create alerts for their utility")

    alert = Alert(
        utility_id=body.utility_id,
        title=body.title,
        description=body.description,
        parameter=body.parameter,
        severity=body.severity,
        actual_value=body.actual_value,
        threshold_value=body.threshold_value,
        unit=body.unit,
        station_id=body.station_id,
        is_internal=body.is_internal,
        created_by_user=current_user.id,
        sla_minutes={"info": 240, "warning": 60, "critical": 15}.get(body.severity, 60),
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return {"id": alert.id, "status": "created"}


@router.patch("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(404, "Alert not found")

    alert.acknowledged_at = datetime.utcnow()
    alert.acknowledged_by = current_user.id
    alert.status = "acknowledged"
    await db.commit()
    return {"status": "acknowledged"}


@router.patch("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(404, "Alert not found")

    alert.resolved_at = datetime.utcnow()
    alert.status = "resolved"
    await db.commit()
    return {"status": "resolved"}


@router.get("/rules")
async def list_alert_rules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin"))(),
):
    """Get alert rules — admin only"""
    q = select(AlertRule)
    if current_user.role == "admin":
        q = q.where(AlertRule.utility_id == current_user.utility_id)

    result = await db.execute(q)
    rules = result.scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "parameter": r.parameter,
            "operator": r.operator,
            "threshold_value": r.threshold_value,
            "severity": r.severity,
            "is_active": r.is_active,
        }
        for r in rules
    ]


@router.post("/rules")
async def create_alert_rule(
    body: CreateAlertRuleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin"))(),
):
    """Create alert rule — admin only"""
    rule = AlertRule(
        name=body.name,
        utility_id=body.utility_id,
        created_by=current_user.id,
        parameter=body.parameter,
        operator=body.operator,
        threshold_value=body.threshold_value,
        threshold_value_2=body.threshold_value_2,
        time_horizon=body.time_horizon,
        severity=body.severity,
        location_scope=body.location_scope,
        station_ids=body.station_ids,
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return {"id": rule.id, "status": "created"}
