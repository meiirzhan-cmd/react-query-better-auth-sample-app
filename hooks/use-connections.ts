// =============================================================================
// Connection Hooks (React Query)
// =============================================================================
// Custom hooks for managing email connections
// =============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EmailConnection,
  ConnectionStatus,
  EmailProvider,
} from "@/types/connection";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface ConnectionsResponse {
  success: boolean;
  data: EmailConnection[];
}

interface ConnectionResponse {
  success: boolean;
  data: EmailConnection;
}

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------
export const connectionKeys = {
  all: ["connections"] as const,
  lists: () => [...connectionKeys.all, "list"] as const,
  detail: (id: string) => [...connectionKeys.all, "detail", id] as const,
};

// -----------------------------------------------------------------------------
// API Functions
// -----------------------------------------------------------------------------
async function fetchConnections(): Promise<ConnectionsResponse> {
  // Use the correct API endpoint
  const response = await fetch("/api/messages/connections");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch connections");
  }

  return response.json();
}

async function disconnectConnection(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/messages/connections/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to disconnect");
  }

  return response.json();
}

async function updateConnection(
  id: string,
  data: Partial<Pick<EmailConnection, "isDefault" | "syncEnabled">>,
): Promise<ConnectionResponse> {
  const response = await fetch(`/api/messages/connections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update connection");
  }

  return response.json();
}

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

/**
 * Fetch all email connections
 */
export function useConnections() {
  return useQuery({
    queryKey: connectionKeys.lists(),
    queryFn: fetchConnections,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Get the default connection
 */
export function useDefaultConnection() {
  const { data, ...rest } = useConnections();

  const defaultConnection =
    data?.data?.find((c) => c.isDefault) || data?.data?.[0];

  return {
    ...rest,
    data: defaultConnection,
    connections: data?.data || [],
  };
}

/**
 * Disconnect an email connection
 */
export function useDisconnectConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
}

/**
 * Update connection settings
 */
export function useUpdateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<EmailConnection, "isDefault" | "syncEnabled">>;
    }) => updateConnection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
}

/**
 * Set a connection as default
 */
export function useSetDefaultConnection() {
  const updateConnection = useUpdateConnection();

  return {
    setDefault: (id: string) =>
      updateConnection.mutate({ id, data: { isDefault: true } }),
    ...updateConnection,
  };
}

/**
 * Toggle sync for a connection
 */
export function useToggleSync() {
  const { data } = useConnections();
  const updateConnection = useUpdateConnection();

  return {
    toggle: (id: string) => {
      const connection = data?.data?.find((c) => c.id === id);
      if (connection) {
        updateConnection.mutate({
          id,
          data: { syncEnabled: !connection.syncEnabled },
        });
      }
    },
    ...updateConnection,
  };
}

// -----------------------------------------------------------------------------
// Connect Helpers
// -----------------------------------------------------------------------------

/**
 * Initiate Gmail connection
 * Redirects to Google OAuth
 */
export function connectGmail(redirectPath?: string) {
  const url = redirectPath
    ? `/api/messages/connections/gmail/connect?redirect=${encodeURIComponent(redirectPath)}`
    : "/api/messages/connections/gmail/connect";

  window.location.href = url;
}

/**
 * Initiate Outlook connection (placeholder)
 */
export function connectOutlook(redirectPath?: string) {
  const url = redirectPath
    ? `/api/messages/connections/outlook/connect?redirect=${encodeURIComponent(redirectPath)}`
    : "/api/messages/connections/outlook/connect";

  window.location.href = url;
}

// -----------------------------------------------------------------------------
// Status Helpers
// -----------------------------------------------------------------------------

export function getConnectionStatusColor(
  status: ConnectionStatus,
): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "active":
      return "success";
    case "expired":
      return "warning";
    case "error":
    case "revoked":
      return "error";
    default:
      return "default";
  }
}

export function getConnectionStatusLabel(status: ConnectionStatus): string {
  switch (status) {
    case "active":
      return "Connected";
    case "expired":
      return "Token Expired";
    case "revoked":
      return "Access Revoked";
    case "error":
      return "Sync Error";
    case "disconnected":
      return "Disconnected";
    default:
      return status;
  }
}

export function getProviderIcon(provider: EmailProvider): string {
  switch (provider) {
    case "gmail":
      return "mail"; // or a specific Gmail icon
    case "outlook":
      return "mail"; // or a specific Outlook icon
    default:
      return "mail";
  }
}

export function getProviderName(provider: EmailProvider): string {
  switch (provider) {
    case "gmail":
      return "Gmail";
    case "outlook":
      return "Outlook";
    case "mock":
      return "Demo";
    default:
      return provider;
  }
}
