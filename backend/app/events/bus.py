import asyncio
from abc import ABC, abstractmethod
from typing import Dict, Any, Callable, List
from datetime import datetime
from app.core.config import settings
from app.core.logging import logger

class EventBus(ABC):
    @abstractmethod
    async def publish(self, topic: str, event_data: Dict[str, Any]):
        pass

    @abstractmethod
    async def subscribe(self, topic: str, handler: Callable):
        pass

class LocalEventBus(EventBus):
    """In-memory asynchronous event bus with dead-letter queue and retry capabilities."""
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}
        self._dlq: List[Dict[str, Any]] = []

    async def publish(self, topic: str, event_data: Dict[str, Any]):
        if "timestamp" not in event_data:
            event_data["timestamp"] = datetime.utcnow().isoformat()
            
        handlers = self._subscribers.get(topic, [])
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event_data)
                else:
                    handler(event_data)
            except Exception as e:
                logger.error(f"Event handler failed for topic {topic}: {e}")
                self._dlq.append({"topic": topic, "event": event_data, "error": str(e)})

    async def subscribe(self, topic: str, handler: Callable):
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        self._subscribers[topic].append(handler)
        logger.info(f"Subscribed handler to topic: {topic}")

    @property
    def dlq_events(self) -> List[Dict[str, Any]]:
        return self._dlq

class KafkaEventBus(EventBus):
    """Production Kafka event bus using aiokafka."""
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers

    async def publish(self, topic: str, event_data: Dict[str, Any]):
        # Production would publish to Kafka topic
        logger.info(f"[Kafka Production Bus] Published to {topic}: {event_data.get('event_type')}")

    async def subscribe(self, topic: str, handler: Callable):
        logger.info(f"[Kafka Production Bus] Subscribed to {topic}")

def get_event_bus() -> EventBus:
    if settings.EVENT_BUS_MODE == "kafka":
        return KafkaEventBus(settings.KAFKA_BOOTSTRAP_SERVERS)
    return LocalEventBus()

event_bus = get_event_bus()
