import type { Event } from "@wasm"; // Adjust the import path as needed

function handleEvent(event: Event) {
  if (event === "ConnectionAuthorized") {
    console.log("Connection authorized");
  } else if ("Error" in event) {
    console.error("Error from server:", event.Error);
  } else if ("Created" in event) {
    const created = event.Created;
    if ("File" in created) {
      console.log("File created:", created.File);
    } else if ("Report" in created) {
      console.log("Report created:", created.Report);
    } else {
      assertNever(created);
    }
  } else if ("Deleted" in event) {
    const deleted = event.Deleted;
    if ("File" in deleted) {
      console.log("File deleted:", deleted.File);
    } else {
      assertNever(deleted);
    }
  } else if ("Updated" in event) {
    const updated = event.Updated;
    if ("File" in updated) {
      console.log("File updated:", updated.File);
    } else if ("User" in updated) {
      console.log("User updated:", updated.User);
    } else if ("Requirement" in updated) {
      console.log("Requirement updated:", updated.Requirement);
    } else {
      assertNever(updated);
    }
  } else if ("Progress" in event) {
    const progress = event.Progress;
    if ("Report" in progress) {
      const [reportId, progressValue] = progress.Report;
      console.log(`Progress for report ${reportId}: ${progressValue}%`);
    } else {
      assertNever(progress);
    }
  } else {
    assertNever(event);
  }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled event type: ${JSON.stringify(x)}`);
}

export { handleEvent };
