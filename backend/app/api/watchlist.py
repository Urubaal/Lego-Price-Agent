from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..database.database import get_db
from ..database.models import User, WatchlistItem, LegoSet, PriceHistory
from ..auth.auth import get_current_active_user

router = APIRouter(prefix="/watchlist", tags=["watchlist"])

class WatchlistItemCreate(BaseModel):
    set_number: str
    target_price: Optional[float] = None
    notification_enabled: bool = True

class WatchlistItemResponse(BaseModel):
    id: int
    set_number: str
    set_name: str
    target_price: Optional[float]
    notification_enabled: bool
    current_best_price: Optional[float]
    price_difference: Optional[float]
    created_at: datetime

@router.post("/", response_model=WatchlistItemResponse)
async def add_to_watchlist(
    item: WatchlistItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a LEGO set to user's watchlist"""
    # Check if set exists
    lego_set = db.query(LegoSet).filter(LegoSet.set_number == item.set_number).first()
    if not lego_set:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LEGO set {item.set_number} not found"
        )
    
    # Check if already in watchlist
    existing_item = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.id,
        WatchlistItem.lego_set_id == lego_set.id
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Set already in watchlist"
        )
    
    # Add to watchlist
    watchlist_item = WatchlistItem(
        user_id=current_user.id,
        lego_set_id=lego_set.id,
        target_price=item.target_price,
        notification_enabled=item.notification_enabled
    )
    
    db.add(watchlist_item)
    db.commit()
    db.refresh(watchlist_item)
    
    # Get current best price
    current_price = db.query(PriceHistory).filter(
        PriceHistory.lego_set_id == lego_set.id
    ).order_by(PriceHistory.total_price.asc()).first()
    
    price_difference = None
    if current_price and item.target_price:
        price_difference = item.target_price - current_price.total_price
    
    return WatchlistItemResponse(
        id=watchlist_item.id,
        set_number=lego_set.set_number,
        set_name=lego_set.name,
        target_price=watchlist_item.target_price,
        notification_enabled=watchlist_item.notification_enabled,
        current_best_price=current_price.total_price if current_price else None,
        price_difference=price_difference,
        created_at=watchlist_item.created_at
    )

@router.get("/", response_model=List[WatchlistItemResponse])
async def get_watchlist(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's watchlist"""
    watchlist_items = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.id
    ).all()
    
    result = []
    for item in watchlist_items:
        lego_set = db.query(LegoSet).filter(LegoSet.id == item.lego_set_id).first()
        current_price = db.query(PriceHistory).filter(
            PriceHistory.lego_set_id == item.lego_set_id
        ).order_by(PriceHistory.total_price.asc()).first()
        
        price_difference = None
        if current_price and item.target_price:
            price_difference = item.target_price - current_price.total_price
        
        result.append(WatchlistItemResponse(
            id=item.id,
            set_number=lego_set.set_number,
            set_name=lego_set.name,
            target_price=item.target_price,
            notification_enabled=item.notification_enabled,
            current_best_price=current_price.total_price if current_price else None,
            price_difference=price_difference,
            created_at=item.created_at
        ))
    
    return result

@router.put("/{item_id}", response_model=WatchlistItemResponse)
async def update_watchlist_item(
    item_id: int,
    item_update: WatchlistItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update watchlist item"""
    watchlist_item = db.query(WatchlistItem).filter(
        WatchlistItem.id == item_id,
        WatchlistItem.user_id == current_user.id
    ).first()
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found"
        )
    
    # Update fields
    watchlist_item.target_price = item_update.target_price
    watchlist_item.notification_enabled = item_update.notification_enabled
    
    db.commit()
    db.refresh(watchlist_item)
    
    # Get updated data
    lego_set = db.query(LegoSet).filter(LegoSet.id == watchlist_item.lego_set_id).first()
    current_price = db.query(PriceHistory).filter(
        PriceHistory.lego_set_id == watchlist_item.lego_set_id
    ).order_by(PriceHistory.total_price.asc()).first()
    
    price_difference = None
    if current_price and watchlist_item.target_price:
        price_difference = watchlist_item.target_price - current_price.total_price
    
    return WatchlistItemResponse(
        id=watchlist_item.id,
        set_number=lego_set.set_number,
        set_name=lego_set.name,
        target_price=watchlist_item.target_price,
        notification_enabled=watchlist_item.notification_enabled,
        current_best_price=current_price.total_price if current_price else None,
        price_difference=price_difference,
        created_at=watchlist_item.created_at
    )

@router.delete("/{item_id}")
async def remove_from_watchlist(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove item from watchlist"""
    watchlist_item = db.query(WatchlistItem).filter(
        WatchlistItem.id == item_id,
        WatchlistItem.user_id == current_user.id
    ).first()
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found"
        )
    
    db.delete(watchlist_item)
    db.commit()
    
    return {"message": "Item removed from watchlist"} 