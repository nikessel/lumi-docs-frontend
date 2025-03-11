import { eventBus } from "@/contexts/wasm-context/EventBus";
import { Event } from "@wasm";
import { addTypeToEvent, WrappedEvent } from "@/contexts/wasm-context/EventHelpers";

function handleEvent(event: Event) {
  const wrappedEvent: WrappedEvent = addTypeToEvent(event);
  eventBus.publish(wrappedEvent);
}

export { handleEvent };
