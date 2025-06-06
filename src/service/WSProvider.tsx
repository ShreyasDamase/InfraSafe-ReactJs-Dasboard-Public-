import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";

interface WSService {
  emit: (event: string, data?: any) => void;
  on: (event: string, cb: (data?: any) => void) => void;
  off: (event: string) => void;
  removeListener: (listenerName: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  connected: boolean;
}

const WSContext = createContext<WSService | undefined>(undefined);

export const WSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useRef<Socket | undefined>(undefined);
  const [connected, setConnected] = useState(false);

  const connectSocket = useCallback(() => {
    console.log("🔌 [DEBUG] Attempting socket connection");

    // Disconnect existing socket if any
    if (socket.current) {
      socket.current.disconnect();
    }

    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      secure: process.env.NODE_ENV === "production",
    });

    socket.current.on("connect", () => {
      console.log("✅ [DEBUG] Socket connected:", socket.current?.id);
      setConnected(true);
    });

    socket.current.on("disconnect", () => {
      console.log("⚠️ [DEBUG] Socket disconnected");
      setConnected(false);
    });

    socket.current.on("connect_error", (err) => {
      console.error("❌ [DEBUG] Connection error:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      setConnected(false);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    connectSocket();
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [connectSocket]);

  const emit = (event: string, data?: any) => {
    if (socket.current?.connected) {
      socket.current.emit(event, data);
    } else {
      console.warn("⚠️ [DEBUG] Cannot emit - socket not connected");
    }
  };

  const on = (event: string, cb: (data?: any) => void) => {
    socket.current?.on(event, cb);
  };

  const off = (event: string) => {
    socket.current?.off(event);
  };

  const removeListener = (listenerName: string) => {
    socket.current?.removeListener(listenerName);
  };

  const disconnect = () => {
    socket.current?.disconnect();
  };

  const reconnect = () => {
    connectSocket();
  };

  const socketService: WSService = {
    emit,
    on,
    off,
    removeListener,
    disconnect,
    reconnect,
    connected,
  };

  return (
    <WSContext.Provider value={socketService}>{children}</WSContext.Provider>
  );
};

export const useWS = (): WSService => {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error("useWS must be used inside WSProvider");
  return ctx;
};
