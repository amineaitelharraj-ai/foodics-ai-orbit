<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LabeebChat } from '@foodics/labeeb-chat';
import ChatHistory from '../components/ChatHistory.vue';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Sidebar state
const sidebarCollapsed = ref(false);

// LabeebChat ref for accessing exposed methods
const labeebChatRef = ref<InstanceType<typeof LabeebChat> | null>(null);

// Get tokens from auth store
const accessToken = ref(authStore.accessToken || '');
const idToken = ref(authStore.idToken || '');

// Session management
const sessions = ref<Array<{ id: string; title: string; createdAt: Date; updatedAt: Date }>>([]);
const currentSessionId = ref<string | null>(null);

// Sync session ID with URL
onMounted(() => {
  const sessionIdFromUrl = route.query.session_id as string | undefined;
  if (sessionIdFromUrl && labeebChatRef.value) {
    labeebChatRef.value.loadSession(sessionIdFromUrl);
  }
});

watch(currentSessionId, (newId) => {
  if (newId) {
    router.replace({ query: { session_id: newId } });
  } else {
    router.replace({ query: {} });
  }
});

// Event handlers
function handleTokenExpired() {
  authStore.logout();
  router.push('/login');
}

function updateSessionsFromChat() {
  if (!labeebChatRef.value?.sessions) return;
  // Exposed refs are automatically unwrapped in Vue 3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatSessions = labeebChatRef.value.sessions as any;
  if (!chatSessions || !Array.isArray(chatSessions)) return;

  sessions.value = chatSessions.map((s: { id: string; messages: Array<{ content: string }>; createdAt: Date; updatedAt: Date }) => ({
    id: s.id,
    title: s.messages[0]?.content?.slice(0, 50) || 'New conversation',
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
}

function handleSessionChanged(sessionId: string | null) {
  currentSessionId.value = sessionId;
  updateSessionsFromChat();
}

function handleMessageSent(_message: string) {
  // Update sessions after message is sent
  updateSessionsFromChat();
}

function handleNewSession() {
  if (labeebChatRef.value) {
    labeebChatRef.value.startNewSession();
  }
}

function handleSelectSession(sessionId: string) {
  if (labeebChatRef.value) {
    labeebChatRef.value.loadSession(sessionId);
  }
}

function handleDeleteSession(sessionId: string) {
  if (labeebChatRef.value) {
    labeebChatRef.value.deleteSession(sessionId);
    // Update sessions list after deletion
    sessions.value = sessions.value.filter((s) => s.id !== sessionId);
  }
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}
</script>

<template>
  <div class="flex h-full">
    <!-- Chat History Sidebar -->
    <ChatHistory
      :sessions="sessions"
      :current-session-id="currentSessionId"
      :collapsed="sidebarCollapsed"
      @new-session="handleNewSession"
      @select-session="handleSelectSession"
      @delete-session="handleDeleteSession"
      @toggle-collapse="toggleSidebar"
    />

    <!-- Chat Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <LabeebChat
        ref="labeebChatRef"
        :token="accessToken"
        :id-token="idToken"
        :show-header="false"
        @token-expired="handleTokenExpired"
        @session-changed="handleSessionChanged"
        @message-sent="handleMessageSent"
      />
    </div>
  </div>
</template>
