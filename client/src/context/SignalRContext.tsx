// Dosya: client/src/context/SignalRContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { Activity } from '@/types'; 

interface FriendRequestNotification {
  friendshipId: string;
  requesterId: string;
  requesterName: string;
  requestedAt: string;
}

// BU ARAYÜZÜ GÜNCELLİYORUZ
interface SignalRContextType {
  connection: signalR.HubConnection | null;
  friendRequests: FriendRequestNotification[];
  removeFriendRequest: (friendshipId: string) => void;
  liveActivities: Activity[]; // <--- EKLENMESİ GEREKEN SATIR
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequestNotification[]>([]);
  // YENİ STATE
  const [liveActivities, setLiveActivities] = useState<Activity[]>([]);

  const handleReceiveFriendRequest = useCallback((newRequest: FriendRequestNotification) => {
    setFriendRequests(prevRequests => {
      if (prevRequests.some(req => req.friendshipId === newRequest.friendshipId)) {
        return prevRequests;
      }
      return [newRequest, ...prevRequests];
    });
  }, []);
  
  // YENİ HANDLER
  const handleReceiveNewActivity = useCallback((newActivity: Activity) => {
    setLiveActivities(prevActivities => [newActivity, ...prevActivities]);
  }, []);

  const removeFriendRequest = (friendshipId: string) => {
    setFriendRequests(prev => prev.filter(req => req.friendshipId !== friendshipId));
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || typeof window === "undefined") return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/activity`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        console.log('SignalR Hub ile bağlantı kuruldu.');
        newConnection.on('ReceiveFriendRequest', handleReceiveFriendRequest);
        // YENİ OLAY DİNLEYİCİSİ
        newConnection.on('ReceiveNewActivity', handleReceiveNewActivity);
      })
      .catch((e: any) => console.error('SignalR bağlantı hatası: ', e));

    return () => {
      newConnection.off('ReceiveFriendRequest', handleReceiveFriendRequest);
      // YENİ DİNLEYİCİYİ KALDIRMA
      newConnection.off('ReceiveNewActivity', handleReceiveNewActivity);
      newConnection.stop();
    };
  }, [handleReceiveFriendRequest, handleReceiveNewActivity]);

  // DEĞERİ GÜNCELLİYORUZ
  const value = { connection, friendRequests, removeFriendRequest, liveActivities }; // <--- liveActivities'i ekliyoruz

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = (): SignalRContextType => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR, SignalRProvider içinde kullanılmalıdır');
  }
  return context;
};