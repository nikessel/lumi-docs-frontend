import { WrappedEvent } from "@/components/EventHelpers";

type EventHandler = (event: WrappedEvent) => void;

class EventBus {
  private subscribers: {
    [K in WrappedEvent["type"]]: Set<EventHandler>;
  } = {
    Created: new Set(),
    Deleted: new Set(),
    Updated: new Set(),
    Progress: new Set(),
    Error: new Set(),
    ConnectionAuthorized: new Set(),
  };

  // Subscribe to a specific event type
  subscribe(eventType: WrappedEvent["type"], callback: EventHandler) {
    this.subscribers[eventType].add(callback);
  }

  // Unsubscribe from a specific event type
  unsubscribe(eventType: WrappedEvent["type"], callback: EventHandler) {
    this.subscribers[eventType].delete(callback);
  }

  // Publish an event to all subscribers
  publish(event: WrappedEvent) {
    const subscribers = this.subscribers[event.type];
    for (const callback of subscribers) {
      callback(event);
    }
  }
}

export const eventBus = new EventBus();
