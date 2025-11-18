from dataclasses import dataclass
from typing import Optional


@dataclass
class Ticket:
    id: Optional[str] = None
    type: str = "general"
    price: float = 0.0
    quantity_available: int = 0
    quantity_sold: int = 0

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'price': self.price,
            'quantity_available': self.quantity_available,
            'quantity_sold': self.quantity_sold
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get('id'),
            type=data.get('type', 'general'),
            price=float(data.get('price', 0.0)),
            quantity_available=int(
                data.get('quantityAvailable') or data.get('quantity_available', 0)),
            quantity_sold=int(data.get('quantitySold')
                              or data.get('quantity_sold', 0))
        )


@dataclass
class TicketPurchase:
    ticket_id: str
    quantity: int

    def to_dict(self):
        return {
            'ticket_id': self.ticket_id,
            'quantity': self.quantity
        }
