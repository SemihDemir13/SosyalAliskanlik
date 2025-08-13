// Dosya: client/src/components/friends/FriendList.tsx
'use client';

import { Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

export interface Friend {
  friendshipId: string;
  friendId: string;
  friendName: string;
}

interface FriendListProps {
  friends: Friend[];
}

export default function FriendList({ friends }: FriendListProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Arkadaşlarım ({friends.length})</Typography>
      {friends.length > 0 ? (
        <List>
          {friends.map((friend) => (
            <ListItem key={friend.friendshipId}>
              <ListItemText primary={friend.friendName} />
              {/* TODO: Arkadaşı silme butonu eklenebilir */}
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">Henüz hiç arkadaşın yok.</Typography>
      )}
    </Paper>
  );
}