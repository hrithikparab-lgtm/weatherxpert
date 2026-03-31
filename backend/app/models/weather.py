from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean,
    ForeignKey, Index, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class WeatherStation(Base):
    __tablename__ = "weather_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    utility_id = Column(Integer, ForeignKey("utilities.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=0)
    station_type = Column(String(50), default="aws")  # aws | solar | wind
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    utility = relationship("Utility", back_populates="stations")
    observations = relationship("WeatherObservation", back_populates="station")
    forecasts = relationship("WeatherForecast", back_populates="station")


class WeatherObservation(Base):
    """Actual observed weather data from AWS stations — 15-min resolution"""
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("weather_stations.id"), nullable=False)
    observed_at = Column(DateTime(timezone=True), nullable=False)

    # Core parameters (BRD Section 4.4)
    temperature = Column(Float)          # °C
    humidity = Column(Float)             # %
    wind_speed = Column(Float)           # m/s
    wind_direction = Column(Float)       # degrees
    wind_gust = Column(Float)            # m/s
    pressure = Column(Float)             # hPa
    rainfall = Column(Float)             # mm
    precipitation = Column(Float)        # mm
    cloud_cover = Column(Float)          # %
    visibility = Column(Float)           # km
    dew_point = Column(Float)            # °C

    # Solar parameters
    ghi = Column(Float)                  # W/m² Global Horizontal Irradiance
    dni = Column(Float)                  # W/m² Direct Normal Irradiance
    dhi = Column(Float)                  # W/m² Diffuse Horizontal Irradiance
    air_density = Column(Float)          # kg/m³

    # Wind at multiple heights (BRD requirement)
    wind_speed_10m = Column(Float)
    wind_speed_50m = Column(Float)
    wind_speed_80m = Column(Float)
    wind_speed_100m = Column(Float)
    wind_speed_120m = Column(Float)
    wind_speed_140m = Column(Float)

    quality_flag = Column(String(20), default="good")  # good|interpolated|suspect|missing
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    station = relationship("WeatherStation", back_populates="observations")

    __table_args__ = (
        Index("idx_obs_station_time", "station_id", "observed_at"),
    )


class WeatherForecast(Base):
    """Forecast data from providers (IMD, Tomorrow.io) — 15-min resolution"""
    __tablename__ = "weather_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("weather_stations.id"), nullable=False)
    provider = Column(String(50), nullable=False)  # imd | tomorrow_io
    forecast_for = Column(DateTime(timezone=True), nullable=False)
    forecast_made_at = Column(DateTime(timezone=True), nullable=False)
    horizon_hours = Column(Float)  # how many hours ahead was this forecast made

    # Same parameters as observations
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    wind_direction = Column(Float)
    wind_gust = Column(Float)
    pressure = Column(Float)
    rainfall = Column(Float)
    cloud_cover = Column(Float)
    ghi = Column(Float)
    dni = Column(Float)
    dhi = Column(Float)
    wind_speed_80m = Column(Float)
    wind_speed_100m = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    station = relationship("WeatherStation", back_populates="forecasts")

    __table_args__ = (
        Index("idx_forecast_station_time_provider", "station_id", "forecast_for", "provider"),
    )
