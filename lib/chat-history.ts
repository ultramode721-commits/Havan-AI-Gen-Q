export type ChatRecord<T = unknown> = {
  id: string;
  title: string;
  messages: T[];
  pinned?: boolean;
  highlighted?: boolean;
  deletedAt?: number;
};

export function renameChat<T>(
  chats: ChatRecord<T>[],
  id: string,
  title: string,
) {
  const nextTitle = title.trim().slice(0, 80);
  if (!nextTitle) return chats;
  return chats.map((chat) =>
    chat.id === id ? { ...chat, title: nextTitle } : chat,
  );
}

export function updateChatFlags<T>(
  chats: ChatRecord<T>[],
  id: string,
  flags: Pick<ChatRecord<T>, "pinned" | "highlighted">,
) {
  return chats.map((chat) =>
    chat.id === id ? { ...chat, ...flags } : chat,
  );
}

export function moveChatToTrash<T>(
  chats: ChatRecord<T>[],
  trash: ChatRecord<T>[],
  id: string,
  deletedAt = Date.now(),
) {
  const chat = chats.find((item) => item.id === id);
  if (!chat) return { chats, trash };
  const { deletedAt: _previousDeletion, ...recoverableChat } = chat;
  return {
    chats: chats.filter((item) => item.id !== id),
    trash: [
      { ...recoverableChat, deletedAt },
      ...trash.filter((item) => item.id !== id),
    ],
  };
}

export function restoreChat<T>(
  chats: ChatRecord<T>[],
  trash: ChatRecord<T>[],
  id: string,
) {
  const chat = trash.find((item) => item.id === id);
  if (!chat) return { chats, trash };
  const { deletedAt: _deletedAt, ...restoredChat } = chat;
  return {
    chats: [restoredChat, ...chats.filter((item) => item.id !== id)],
    trash: trash.filter((item) => item.id !== id),
  };
}

export function permanentlyDeleteChat<T>(
  trash: ChatRecord<T>[],
  id: string,
) {
  return trash.filter((item) => item.id !== id);
}
