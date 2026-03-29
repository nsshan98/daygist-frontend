interface GoogleAccounts {
  id: {
    initialize(config: { client_id: string; callback: (response: { credential?: string }) => void }): void;
    prompt(callback?: (notification: PromptMomentNotification) => void): void;
  };
}

interface PromptMomentNotification {
  getMomentType(): string;
}

interface Window {
  google?: {
    accounts: GoogleAccounts;
  };
}
