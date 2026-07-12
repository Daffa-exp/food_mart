-- =========================================================
-- LIVE CHAT (customer <-> admin)
-- Sebelumnya "Live Chat" di frontend hanya simulasi localStorage,
-- tidak pernah tersambung ke backend/admin. Tabel ini menyimpan
-- percakapan & pesan yang sesungguhnya.
-- =========================================================

create type chat_context_type as enum ('produk', 'pesanan', 'checkout', 'support');
create type chat_sender_type as enum ('customer', 'admin');

create table chat_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type chat_context_type not null,
  context text, -- nama produk / nomor pesanan, boleh kosong untuk support umum
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (user_id, type, context)
);
create index idx_chat_conversations_user on chat_conversations(user_id);
create index idx_chat_conversations_last_message on chat_conversations(last_message_at desc);

create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references chat_conversations(id) on delete cascade,
  sender chat_sender_type not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);
create index idx_chat_messages_conversation on chat_messages(conversation_id, created_at);

alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

-- Customer hanya boleh lihat percakapan miliknya sendiri (backend admin
-- selalu pakai service role sehingga tidak terikat RLS ini).
create policy "chat_conversations_owner_only" on chat_conversations
  for all using (user_id = (select id from users where auth_id = auth.uid()));

create policy "chat_messages_owner_only" on chat_messages
  for all using (
    conversation_id in (
      select id from chat_conversations
      where user_id = (select id from users where auth_id = auth.uid())
    )
  );
