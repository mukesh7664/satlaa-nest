import { fetchServer } from "./api/server-fetch";

export interface WhatsAppButtonSettings {
  isEnabled: boolean;
  phoneNumber: string;
  message: string;
}

export interface PublicSettings {
  whatsappButton: WhatsAppButtonSettings;
  // Add other public settings here as needed
}

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const res = await fetchServer("/settings/public");
    if (!res.ok) {
      throw new Error(`Failed to fetch public settings: ${res.status}`);
    }
    const result = await res.json();
    return {
      whatsappButton: result.data?.whatsappButton || {
        isEnabled: false,
        phoneNumber: "",
        message: "",
      },
    };
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return {
      whatsappButton: {
        isEnabled: false,
        phoneNumber: "",
        message: "",
      },
    };
  }
}
