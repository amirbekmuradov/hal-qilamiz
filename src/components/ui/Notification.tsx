import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { removeNotification, NotificationType } from '../../store/slices/uiSlice';

interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  autoClose = true,
  duration = 5000,
}) => {
  const dispatch = useDispatch();

  // Get the appropriate icon based on the notification type
  const getIcon = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return (
          <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case NotificationType.ERROR:
        return (
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case NotificationType.WARNING:
        return (
          <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case NotificationType.INFO:
      default:
        return (
          <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  // Get the appropriate background color based on the notification type
  const getBackgroundColor = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'bg-green-50';
      case NotificationType.ERROR:
        return 'bg-red-50';
      case NotificationType.WARNING:
        return 'bg-yellow-50';
      case NotificationType.INFO:
      default:
        return 'bg-blue-50';
    }
  };

  // Get the appropriate border color based on the notification type
  const getBorderColor = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'border-green-400';
      case NotificationType.ERROR:
        return 'border-red-400';
      case NotificationType.WARNING:
        return 'border-yellow-400';
      case NotificationType.INFO:
      default:
        return 'border-blue-400';
    }
  };

  // Auto-close the notification after the specified duration
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(id));
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoClose, dispatch, duration, id]);

  return (
    <div
      className={`max-w-sm w-full ${getBackgroundColor()} border-l-4 ${getBorderColor()} rounded-md shadow-md`}
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm text-gray-800">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => dispatch(removeNotification(id))}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;