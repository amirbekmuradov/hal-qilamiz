import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for notifications
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

// Define UI state
interface UIState {
  notifications: Notification[];
  isLoading: boolean;
  modals: {
    login: boolean;
    register: boolean;
    createIssue: boolean;
    confirmAction: {
      isOpen: boolean;
      title: string;
      message: string;
      confirmAction: (() => void) | null;
    };
  };
  theme: 'light' | 'dark';
  language: 'uz' | 'ru' | 'en';
  isSidebarOpen: boolean;
}

// Initial state
const initialState: UIState = {
  notifications: [],
  isLoading: false,
  modals: {
    login: false,
    register: false,
    createIssue: false,
    confirmAction: {
      isOpen: false,
      title: '',
      message: '',
      confirmAction: null,
    },
  },
  theme: 'light',
  language: 'uz',
  isSidebarOpen: false,
};

// Create the UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Notification management
    addNotification(state, action: PayloadAction<Omit<Notification, 'id'>>) {
      const id = Date.now().toString();
      state.notifications.push({
        ...action.payload,
        id,
        autoClose: action.payload.autoClose ?? true,
        duration: action.payload.duration ?? 5000,
      });
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    // Modal management
    openModal(
      state,
      action: PayloadAction<keyof Omit<UIState['modals'], 'confirmAction'>>
    ) {
      const modalName = action.payload;
      state.modals[modalName] = true;
    },
    closeModal(
      state,
      action: PayloadAction<keyof Omit<UIState['modals'], 'confirmAction'>>
    ) {
      const modalName = action.payload;
      state.modals[modalName] = false;
    },
    openConfirmModal(
      state,
      action: PayloadAction<{
        title: string;
        message: string;
        confirmAction: () => void;
      }>
    ) {
      state.modals.confirmAction = {
        isOpen: true,
        ...action.payload,
      };
    },
    closeConfirmModal(state) {
      state.modals.confirmAction = {
        isOpen: false,
        title: '',
        message: '',
        confirmAction: null,
      };
    },

    // Theme and language settings
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
      // Save to localStorage in a thunk middleware
    },
    setLanguage(state, action: PayloadAction<'uz' | 'ru' | 'en'>) {
      state.language = action.payload;
      // Save to localStorage in a thunk middleware
    },

    // Sidebar
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const {
  setLoading,
  addNotification,
  removeNotification,
  openModal,
  closeModal,
  openConfirmModal,
  closeConfirmModal,
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;