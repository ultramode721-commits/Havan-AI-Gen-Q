import test from "node:test";
import assert from "node:assert/strict";
import {
  moveChatToTrash,
  permanentlyDeleteChat,
  renameChat,
  restoreChat,
  updateChatFlags,
} from "../lib/chat-history";

const chat = { id: "chat-1", title: "Original", messages: [{ content: "Hello" }] };

test("renaming trims whitespace and caps a title without changing messages", () => {
  const renamed = renameChat([chat], chat.id, `  ${"a".repeat(90)}  `);
  assert.equal(renamed[0].title.length, 80);
  assert.deepEqual(renamed[0].messages, chat.messages);
  assert.equal(renameChat([chat], chat.id, "  ")[0].title, "Original");
});

test("pin and highlight flags are saved on the selected conversation", () => {
  const flagged = updateChatFlags([chat], chat.id, {
    pinned: true,
    highlighted: true,
  });
  assert.equal(flagged[0].pinned, true);
  assert.equal(flagged[0].highlighted, true);
});

test("soft deletion can be restored with messages and flags intact", () => {
  const original = { ...chat, pinned: true, highlighted: true };
  const moved = moveChatToTrash([original], [], original.id, 123);
  assert.equal(moved.chats.length, 0);
  assert.equal(moved.trash[0].deletedAt, 123);
  const restored = restoreChat([], moved.trash, original.id);
  assert.equal(restored.trash.length, 0);
  assert.deepEqual(restored.chats[0], original);
});

test("permanent deletion removes only the chosen trashed conversation", () => {
  const trash = [chat, { ...chat, id: "chat-2" }];
  assert.deepEqual(permanentlyDeleteChat(trash, "chat-1"), [trash[1]]);
});
