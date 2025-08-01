from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class LegoSet(Base):
    __tablename__ = "lego_sets"
    
    id = Column(Integer, primary_key=True, index=True)
    set_number = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(500), nullable=False)
    theme = Column(String(100))
    year_released = Column(Integer)
    pieces = Column(Integer)
    minifigures = Column(Integer)
    age_range = Column(String(20))
    price_msrp = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    prices = relationship("PriceHistory", back_populates="lego_set")
    recommendations = relationship("PriceRecommendation", back_populates="lego_set")

class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    lego_set_id = Column(Integer, ForeignKey("lego_sets.id"), nullable=False)
    store_name = Column(String(100), nullable=False)
    store_url = Column(Text)
    price = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0.0)
    total_price = Column(Float, nullable=False)
    condition = Column(String(50), default="new")  # new, used, damaged
    availability = Column(Boolean, default=True)
    currency = Column(String(3), default="PLN")
    scraped_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lego_set = relationship("LegoSet", back_populates="prices")

class PriceRecommendation(Base):
    __tablename__ = "price_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    lego_set_id = Column(Integer, ForeignKey("lego_sets.id"), nullable=False)
    current_best_price = Column(Float, nullable=False)
    average_market_price = Column(Float, nullable=False)
    price_difference = Column(Float, nullable=False)
    price_percentage = Column(Float, nullable=False)
    recommendation = Column(String(20), nullable=False)  # buy, wait, avoid
    confidence_score = Column(Float, nullable=False)
    reasoning = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lego_set = relationship("LegoSet", back_populates="recommendations")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    watchlist = relationship("WatchlistItem", back_populates="user")

class WatchlistItem(Base):
    __tablename__ = "watchlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lego_set_id = Column(Integer, ForeignKey("lego_sets.id"), nullable=False)
    target_price = Column(Float)
    notification_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="watchlist") 