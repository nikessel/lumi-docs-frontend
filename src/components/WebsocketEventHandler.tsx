import { eventBus } from "@/components/EventBus";
import { Event } from "@wasm";
import { addTypeToEvent, WrappedEvent } from "@/components/EventHelpers";

function handleEvent(event: Event) {
  const wrappedEvent: WrappedEvent = addTypeToEvent(event);
  eventBus.publish(wrappedEvent);
}

export { handleEvent };
