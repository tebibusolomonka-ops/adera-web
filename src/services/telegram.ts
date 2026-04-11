// Telegram Web App SDK Integration
// Docs: https://core.telegram.org/bots/webapps

// Extend window to include Telegram types
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
}

interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

// ======= Helper Functions =======

/**
 * Check if the app is running inside Telegram
 */
export const isTelegramMiniApp = (): boolean => {
  return !!window.Telegram?.WebApp?.initData;
};

/**
 * Get the Telegram WebApp instance (or null if not in Telegram)
 */
export const getTelegramWebApp = (): TelegramWebApp | null => {
  return window.Telegram?.WebApp || null;
};

/**
 * Get the Telegram user data (if running inside Telegram)
 */
export const getTelegramUser = (): TelegramUser | null => {
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
};

/**
 * Initialize the Telegram Web App — call this when your React app mounts
 */
export const initTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (!tg) return;

  // Tell Telegram the app is ready (removes loading indicator)
  tg.ready();

  // Expand to full height
  tg.expand();

  // Set header to match our dark theme
  tg.setHeaderColor('#0f0f1a');
  tg.setBackgroundColor('#0f0f1a');

  // Enable closing confirmation (prevents accidental close)
  tg.enableClosingConfirmation();

  console.log('[Telegram] Mini App initialized', {
    platform: tg.platform,
    colorScheme: tg.colorScheme,
    user: tg.initDataUnsafe?.user?.first_name || 'N/A',
  });
};

/**
 * Haptic feedback — makes the phone vibrate
 */
export const hapticFeedback = {
  light: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('light'),
  medium: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('medium'),
  heavy: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('heavy'),
  success: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('success'),
  error: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('error'),
  warning: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('warning'),
  select: () => getTelegramWebApp()?.HapticFeedback?.selectionChanged(),
};
