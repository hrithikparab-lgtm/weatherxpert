from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Utility(Base):
    __tablename__ = "utilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # e.g. "Mumbai Distribution"
    short_name = Column(String(50))
    region = Column(String(100))
    type = Column(String(50))  # distribution / solar / wind / hybrid
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="utility")
    stations = relationship("WeatherStation", back_populates="utility")
    alerts = relationship("Alert", back_populates="utility")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False, default="operator")
    # roles: superadmin | admin | operator
    utility_id = Column(Integer, ForeignKey("utilities.id"), nullable=True)
    # null = superadmin (access to all utilities)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    utility = relationship("Utility", back_populates="users")
