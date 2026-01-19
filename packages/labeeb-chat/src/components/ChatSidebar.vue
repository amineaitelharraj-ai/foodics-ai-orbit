<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  MessageSquare,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  MoreVertical,
} from 'lucide-vue-next';
import type { Session } from '@shared/api/session-storage';

interface Props {
  sessions: Session[];
  currentSessionId: string | null;
  isCollapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapsed: false,
});

const emit = defineEmits<{
  newSession: [];
  loadSession: [sessionId: string];
  deleteSession: [sessionId: string];
  toggleCollapse: [];
}>();

const searchQuery = ref('');
const sessionMenuOpen = ref<string | null>(null);

const filteredSessions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.sessions;
  }
  const query = searchQuery.value.toLowerCase();
  return props.sessions.filter(
    (session) =>
      session.title?.toLowerCase().includes(query) ||
      session.messages?.some((m) => m.content.toLowerCase().includes(query))
  );
});

const groupedSessions = computed(() => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups: Record<string, Session[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'This Month': [],
    Older: [],
  };

  filteredSessions.value.forEach((session) => {
    const sessionDate = new Date(session.updatedAt || session.createdAt);

    if (sessionDate >= today) {
      groups['Today']!.push(session);
    } else if (sessionDate >= yesterday) {
      groups['Yesterday']!.push(session);
    } else if (sessionDate >= lastWeek) {
      groups['This Week']!.push(session);
    } else if (sessionDate >= lastMonth) {
      groups['This Month']!.push(session);
    } else {
      groups['Older']!.push(session);
    }
  });

  return Object.entries(groups).filter(([, sessions]) => sessions.length > 0);
});

function formatSessionTitle(session: Session): string {
  if (session.title && session.title !== 'Untitled' && session.title !== 'New Chat') {
    return session.title.length > 30 ? session.title.slice(0, 30) + '...' : session.title;
  }
  const firstMessage = session.messages?.find((m) => m.role === 'user');
  if (firstMessage) {
    const content = firstMessage.content.trim();
    return content.length > 30 ? content.slice(0, 30) + '...' : content;
  }
  return 'New conversation';
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function handleNewSession(): void {
  emit('newSession');
}

function handleLoadSession(sessionId: string): void {
  emit('loadSession', sessionId);
  sessionMenuOpen.value = null;
}

function handleDeleteSession(sessionId: string, event: Event): void {
  event.stopPropagation();
  emit('deleteSession', sessionId);
  sessionMenuOpen.value = null;
}

function toggleSessionMenu(sessionId: string, event: Event): void {
  event.stopPropagation();
  sessionMenuOpen.value = sessionMenuOpen.value === sessionId ? null : sessionId;
}

function handleToggleCollapse(): void {
  emit('toggleCollapse');
}
</script>

<template>
  <aside
    class="flex flex-col h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300"
    :class="isCollapsed ? 'w-16' : 'w-72'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <template v-if="!isCollapsed">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h2>
      </template>
      <button
        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="handleToggleCollapse"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-5 h-5" />
        <ChevronRight v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- New Chat Button -->
    <div class="p-3">
      <button
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        :class="isCollapsed ? 'px-2' : ''"
        @click="handleNewSession"
      >
        <Plus class="w-5 h-5" />
        <span v-if="!isCollapsed">New Chat</span>
      </button>
    </div>

    <!-- Search (only when expanded) -->
    <div v-if="!isCollapsed" class="px-3 pb-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search conversations..."
          class="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Sessions List -->
    <div class="flex-1 overflow-y-auto px-3">
      <template v-if="isCollapsed">
        <!-- Collapsed view: just icons -->
        <div class="space-y-2 py-2">
          <button
            v-for="session in filteredSessions.slice(0, 10)"
            :key="session.id"
            class="w-full p-2 rounded-lg transition-colors"
            :class="
              session.id === currentSessionId
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            "
            :title="formatSessionTitle(session)"
            @click="handleLoadSession(session.id)"
          >
            <MessageSquare class="w-5 h-5 mx-auto" />
          </button>
        </div>
      </template>

      <template v-else>
        <!-- Expanded view: grouped sessions -->
        <div v-if="groupedSessions.length === 0" class="py-8 text-center">
          <MessageSquare class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p class="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Start a new chat to begin
          </p>
        </div>

        <div v-else class="space-y-4 pb-4">
          <div v-for="[groupName, groupSessions] in groupedSessions" :key="groupName">
            <div class="flex items-center gap-2 px-2 py-1.5">
              <Calendar class="w-3.5 h-3.5 text-gray-400" />
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ groupName }}
              </span>
            </div>

            <div class="space-y-1">
              <div
                v-for="session in groupSessions"
                :key="session.id"
                class="group relative rounded-lg cursor-pointer transition-colors"
                :class="
                  session.id === currentSessionId
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                "
                @click="handleLoadSession(session.id)"
              >
                <div class="flex items-start gap-3 p-3">
                  <div
                    class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    :class="
                      session.id === currentSessionId
                        ? 'bg-primary-200 dark:bg-primary-800 text-primary-600 dark:text-primary-400'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    "
                  >
                    <MessageSquare class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium truncate"
                      :class="
                        session.id === currentSessionId
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-900 dark:text-white'
                      "
                    >
                      {{ formatSessionTitle(session) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {{ formatTime(session.updatedAt || session.createdAt) }}
                    </p>
                  </div>

                  <!-- Session menu button -->
                  <button
                    class="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    @click="toggleSessionMenu(session.id, $event)"
                  >
                    <MoreVertical class="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <!-- Session dropdown menu -->
                <div
                  v-if="sessionMenuOpen === session.id"
                  class="absolute right-2 top-full z-10 mt-1 w-36 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <button
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    @click="handleDeleteSession(session.id, $event)"
                  >
                    <Trash2 class="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>
