import NotificationService from "@/contexts/notification-context/notification-service";
import type { ClientSideError, ErrorKind } from "@wasm";

// Global error messages
const errorMessages: Record<ErrorKind, string> = {
    Validation: "Invalid input. Please check your data.",
    NotFound: "Requested resource was not found.",
    AlreadyExists: "This item already exists.",
    EmailNotVerified: "Please verify your email before proceeding.",
    Unauthorized: "You are not authorized to perform this action.",
    Timeout: "Request timed out. Please try again.",
    Deserialization: "Error processing request data.",
    Serialization: "Error formatting request data.",
    Server: "An unexpected server error occurred. Please try again later.",
};

// Fetch wrapper function
export async function fetchWrapper<T>(
    fn: () => Promise<{ output?: T; error?: ClientSideError }>,
    showError = true
): Promise<{ data: { output?: T; error?: ClientSideError } | null; error: string | null }> {
    try {
        const response = await fn();
        console.log("asdasdasd123", response);

        // ✅ If API returns an error, handle it properly
        if (response.error) {
            console.error("❌ API returned an error:", response.error);

            const errorMessage =
                response.error.message || errorMessages[response.error.kind] || "An unknown error occurred.";

            if (showError) {
                NotificationService.showError(errorMessage);
            }

            return { data: null, error: errorMessage };
        }

        // ✅ API call succeeded, return full response (not just response.output)
        return { data: response, error: null };
    } catch (err) {
        console.error("❌ Fetch exception:", err);

        let errorMessage = "An unknown error occurred.";
        if (typeof err === "object" && err !== null && "kind" in err && "message" in err) {
            const backendError = err as ClientSideError;
            errorMessage = errorMessages[backendError.kind] || backendError.message || "An error occurred.";
        }

        if (showError) {
            NotificationService.showError(errorMessage);
        }

        return { data: null, error: errorMessage };
    }
}
