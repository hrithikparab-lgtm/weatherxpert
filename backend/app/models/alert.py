from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class AlertRule(Base):
    """Alert rules configured by Admin/Superadmin"""
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    utility_id = Column(Integer, ForeignKey("utilities.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Rule definition
    parameter = Column(String(50), nullable=False)  # temperature|wind_speed|rainfall|etc
    operator = Column(String(10), nullable=False)    # gt|lt|gte|lte|between
    threshold_value = Column(Float, nullable=False)
    threshold_value_2 = Column(Float, nullable=True)  # for "between" operator
    time_horizon = Column(String(20), default="realtime")  # realtime|15min|1hour|day_ahead
    severity = Column(String(20), default="warning")  # info|warning|critical
    location_scope = Column(String(20), default="all")  # all|specific
    station_ids = Column(JSON, default=list)  # list of station IDs

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    alerts = relationship("Alert", back_populates="rule")


class Alert(Base):
    """Triggered alert instances"""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("alert_rules.id"), nullable=True)
    utility_id = Column(Integer, ForeignKey("utilities.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("weather_stations.id"), nullable=True)

    title = Column(String(300), nullable=False)
    description = Column(Text)
    parameter = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)  # info|warning|critical
    status = Column(String(20), default="active")   # active|resolved|acknowledged
    provider = Column(String(50), default="system") # imd|tomorrow_io|system|internal

    actual_value = Column(Float)
    threshold_value = Column(Float)
    unit = Column(String(20))

    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # SLA tracking
    sla_minutes = Column(Integer, default=60)
    escalation_level = Column(Integer, default=0)  # 0|1|2|3

    is_internal = Column(Boolean, default=False)
    created_by_user = Column(Integer, ForeignKey("users.id"), nullable=True)

    rule = relationship("AlertRule", back_populates="alerts")
    utility = relationship("Utility", back_populates="alerts")
