interface GoogleAccounts {
  id: {
    initialize(config: { 
      client_id: string; 
      callback: (response: { credential?: string }) => void;
      auto_select?: boolean;
    }): void;
    prompt(callback?: (notification: PromptMomentNotification) => void): void;
    renderButton(element: HTMLElement, options: { 
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      width?: string | number;
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signup_with';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      logo_alignment?: 'left' | 'center';
      locale?: string;
    }): void;
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
