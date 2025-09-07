// Dosya: client/src/context/SignalRContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { Activity } from '@/types';
import { MessageDto } from '@/types';

interface FriendRequestNotification {
  friendshipId: string;
  requesterId: string;
  requesterName: string;
  requestedAt: string;
}

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  friendRequests: FriendRequestNotification[];
  removeFriendRequest: (friendshipId: string) => void;
  liveActivities: Activity[];
  liveMessages: MessageDto[];
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number | ((prev: number) => number)) => void;
  addLiveMessage: (message: MessageDto) => void;
  setActiveConversationId: (id: string | null) => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequestNotification[]>([]);
  const [liveActivities, setLiveActivities] = useState<Activity[]>([]);
  const [liveMessages, setLiveMessages] = useState<MessageDto[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const addLiveMessage = useCallback((newMessage: MessageDto) => {
    // Sadece gelen mesajın ait olduğu konuşma, o an aktif olarak
    // görüntülenmiyorsa okunmamış mesaj sayacını artır.
    if (newMessage.conversationId !== activeConversationId) {
      setUnreadMessageCount(prev => prev + 1);
    }

    setLiveMessages(prevMessages => {
        if (prevMessages.some(msg => msg.id === newMessage.id)) return prevMessages;
        return [newMessage, ...prevMessages];
    });
  }, [activeConversationId]); // Bağımlılık dizisine activeConversationId'yi ekledik.

  const handleReceiveFriendRequest = useCallback((newRequest: FriendRequestNotification) => {
    setFriendRequests(prevRequests => {
      if (prevRequests.some(req => req.friendshipId === newRequest.friendshipId)) {
        return prevRequests;
      }
      return [newRequest, ...prevRequests];
    });
  }, []);
  
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
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/activity`, { accessTokenFactory: () => token })
      .withAutomaticReconnect().build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        console.log('SignalR Hub ile bağlantı kuruldu.');
        newConnection.on('ReceiveFriendRequest', handleReceiveFriendRequest);
        newConnection.on('ReceiveNewActivity', handleReceiveNewActivity);
        newConnection.on('ReceiveMessage', addLiveMessage);
      })
      .catch((e: any) => console.error('SignalR bağlantı hatası: ', e));

    return () => {
      newConnection.off('ReceiveFriendRequest', handleReceiveFriendRequest);
      newConnection.off('ReceiveNewActivity', handleReceiveNewActivity);
      newConnection.off('ReceiveMessage', addLiveMessage);
      newConnection.stop();
    };
  }, [handleReceiveFriendRequest, handleReceiveNewActivity, addLiveMessage]);

  const value = { 
    connection, 
    friendRequests, 
    removeFriendRequest, 
    liveActivities,
    liveMessages,
    unreadMessageCount,
    setUnreadMessageCount,
    addLiveMessage,
    setActiveConversationId
  };

  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
};

export const useSignalR = (): SignalRContextType => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR, SignalRProvider içinde kullanılmalıdır');
  }
  return context;
};