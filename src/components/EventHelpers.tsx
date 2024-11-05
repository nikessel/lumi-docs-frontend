import {
  Event,
  CreateEvent,
  DeleteEvent,
  UpdateEvent,
  ProgressEvent,
} from "@wasm";

export type WrappedEvent =
  | { type: "Created"; payload: CreateEvent }
  | { type: "Deleted"; payload: DeleteEvent }
  | { type: "Updated"; payload: UpdateEvent }
  | { type: "Progress"; payload: ProgressEvent }
  | { type: "Error"; payload: string }
  | { type: "ConnectionAuthorized" };

// Define the mapping from event types to payloads
export type EventPayloadMap = {
  ConnectionAuthorized: { type: "ConnectionAuthorized" };
  Error: { type: "Error"; Error: string };
  Created: { type: "Created"; Created: CreateEvent };
  Deleted: { type: "Deleted"; Deleted: DeleteEvent };
  Updated: { type: "Updated"; Updated: UpdateEvent };
  Progress: { type: "Progress"; Progress: ProgressEvent };
};

// EventWithType is a union of all possible event payloads
export type EventWithType = EventPayloadMap[keyof EventPayloadMap];

export function addTypeToEvent(event: Event): WrappedEvent {
  if (event === "ConnectionAuthorized") {
    return { type: "ConnectionAuthorized" };
  } else if ("Error" in event) {
    return { type: "Error", payload: event.Error };
  } else if ("Created" in event) {
    return { type: "Created", payload: event.Created };
  } else if ("Deleted" in event) {
    return { type: "Deleted", payload: event.Deleted };
  } else if ("Updated" in event) {
    return { type: "Updated", payload: event.Updated };
  } else if ("Progress" in event) {
    return { type: "Progress", payload: event.Progress };
  } else {
    throw new Error(`Unhandled event type: ${JSON.stringify(event)}`);
  }
}
