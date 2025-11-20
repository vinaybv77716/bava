import { useEffect, useCallback, useRef, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useRealtime = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventHandlers = useRef({});

  // Initialize Socket.IO connection
  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('WebSocket connected:', socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const subscribeToEvents = useCallback((eventType, callback) => {
    if (!socketRef.current) {
      console.warn('Socket not initialized');
      return () => {};
    }

    // Store handler reference
    if (!eventHandlers.current[eventType]) {
      eventHandlers.current[eventType] = [];
    }
    eventHandlers.current[eventType].push(callback);

    // Subscribe to event
    socketRef.current.on(eventType, callback);
    console.log(`Subscribed to ${eventType}`);

    // Return unsubscribe function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(eventType, callback);
        console.log(`Unsubscribed from ${eventType}`);

        // Remove from handlers list
        if (eventHandlers.current[eventType]) {
          eventHandlers.current[eventType] = eventHandlers.current[eventType].filter(
            h => h !== callback
          );
        }
      }
    };
  }, []);

  const subscribeToProcessingProgress = useCallback((fileId, callback) => {
    const handlers = [];

    // Subscribe to all processing events for this file
    handlers.push(subscribeToEvents('processing:started', (data) => {
      if (data.fileId === fileId) {
        callback({ type: 'started', ...data });
      }
    }));

    handlers.push(subscribeToEvents('processing:progress', (data) => {
      if (data.fileId === fileId) {
        callback({ type: 'progress', ...data });
      }
    }));

    handlers.push(subscribeToEvents('processing:percentage', (data) => {
      if (data.fileId === fileId) {
        callback({ type: 'percentage', ...data });
      }
    }));

    handlers.push(subscribeToEvents('processing:validation', (data) => {
      if (data.fileId === fileId) {
        callback({ type: 'validation', ...data });
      }
    }));

    handlers.push(subscribeToEvents('processing:completed', (data) => {
      if (data.fileId === fileId) {
        callback({ type: 'completed', ...data });
      }
    }));

    handlers.push(subscribeToEvents('processing:failed', (data) => {
      if (data.fileId === fileId) {
        callback({ type: 'failed', ...data });
      }
    }));

    handlers.push(subscribeToEvents('processing:error', (data) => {
      if (data.fileId === fileId) {
        callback({ type: 'error', ...data });
      }
    }));

    // Return unsubscribe function that removes all handlers
    return () => {
      handlers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribeToEvents]);

  const subscribeToManuscriptUpdates = useCallback((manuscriptId, callback) => {
    return subscribeToEvents('manuscript_status_update', (event) => {
      if (event.manuscript_id === manuscriptId) {
        callback(event);
      }
    });
  }, [subscribeToEvents]);

  const subscribeToUserNotifications = useCallback((userId, callback) => {
    return subscribeToEvents('user_notification', (event) => {
      if (event.user_id === userId) {
        callback(event);
      }
    });
  }, [subscribeToEvents]);

  const subscribeToSystemAlerts = useCallback((callback) => {
    return subscribeToEvents('system_alert', callback);
  }, [subscribeToEvents]);

  const subscribeToAdminNotifications = useCallback((callback) => {
    return subscribeToEvents('admin_notification', callback);
  }, [subscribeToEvents]);

  return {
    isConnected,
    subscribeToEvents,
    subscribeToProcessingProgress,
    subscribeToManuscriptUpdates,
    subscribeToUserNotifications,
    subscribeToSystemAlerts,
    subscribeToAdminNotifications,
  };
};

export default useRealtime;
