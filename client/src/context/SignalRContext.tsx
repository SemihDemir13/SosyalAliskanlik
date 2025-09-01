// Dosya: client/src/context/SignalRContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

// DTO'yu frontend tarafında da tanımlıyoruz
// Backend'deki FriendRequestDto ile eşleşmeli
interface FriendRequestNotification {
  friendshipId: string;
  requesterId: string;
  requesterName: string;
  requestedAt: string;
}

// Context'in tutacağı verinin tipini tanımlıyoruz
interface SignalRContextType {
  connection: signalR.HubConnection | null;
  friendRequests: FriendRequestNotification[];
  removeFriendRequest: (friendshipId: string) => void;
}

// Context'i null bir başlangıç değeriyle oluşturuyoruz
const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

// Provider bileşenimiz
export const SignalRProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequestNotification[]>([]);

  // Yeni bir arkadaşlık isteği geldiğinde state'i güncelleyen fonksiyon
  const handleReceiveFriendRequest = useCallback((newRequest: FriendRequestNotification) => {
    console.log("Yeni arkadaşlık isteği alındı:", newRequest);
    setFriendRequests(prevRequests => {
      // Eğer aynı istek zaten listede varsa ekleme (önlem amaçlı)
      if (prevRequests.some(req => req.friendshipId === newRequest.friendshipId)) {
        return prevRequests;
      }
      return [newRequest, ...prevRequests];
    });
  }, []);
  
  // Bir istek kabul/reddedildiğinde listeden çıkaran fonksiyon
  const removeFriendRequest = (friendshipId: string) => {
    setFriendRequests(prev => prev.filter(req => req.friendshipId !== friendshipId));
  };

  useEffect(() => {
    // Tarayıcı ortamında değilsek (örn. server-side rendering sırasında) işlem yapma
    if (typeof window === "undefined") return;

    const token = localStorage.getItem('accessToken');
    // Eğer token yoksa (kullanıcı giriş yapmamışsa) bağlantı kurma
    if (!token) return;

    // Yeni bir Hub bağlantısı oluşturuyoruz
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/activity`, {
        // Bağlantı isteğinin header'ına JWT token'ını ekliyoruz
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect() // Bağlantı koparsa otomatik olarak yeniden bağlanmayı dene
      .build();

    setConnection(newConnection);

    // Bağlantı kurulduktan sonra olay dinleyicilerini (listeners) ekle
    newConnection.start()
      .then(() => {
        console.log('SignalR Hub ile bağlantı kuruldu.');
        
        // Backend'den "ReceiveFriendRequest" olayı geldiğinde bu fonksiyonu çalıştır
        newConnection.on('ReceiveFriendRequest', handleReceiveFriendRequest);
        
        // Gelecekte eklenecek diğer olaylar buraya eklenebilir
        // newConnection.on('ReceiveNewActivity', (activity) => { ... });
      })
      .catch((e: any) => console.error('SignalR bağlantı hatası: ', e));

    // Bileşen unmount olduğunda (örneğin kullanıcı çıkış yaptığında)
    // olay dinleyicilerini kaldır ve bağlantıyı sonlandır
    return () => {
      newConnection.off('ReceiveFriendRequest', handleReceiveFriendRequest);
      newConnection.stop();
    };
  }, [handleReceiveFriendRequest]); // handleReceiveFriendRequest'i bağımlılık dizisine ekliyoruz

  const value = { connection, friendRequests, removeFriendRequest };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

// Custom Hook'umuz
// Bu hook sayesinde herhangi bir bileşen kolayca SignalR context'ine erişebilir
export const useSignalR = (): SignalRContextType => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR, SignalRProvider içinde kullanılmalıdır');
  }
  return context;
};