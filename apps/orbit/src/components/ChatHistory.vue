<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
} from 'lucide-vue-next';

export interface Session {
  id: string;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface Props {
  sessions: Session[];
  currentSessionId: string | null;
  collapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
});

const emit = defineEmits<{
  newSession: [];
  selectSession: [sessionId: string];
  deleteSession: [sessionId: string];
  toggleCollapse: [];
}>();

const INITIAL_CHATS_PER_DAY = 3;

// Track visible count per date group
const visibleCounts = ref<Record<string, number>>({});
const hoveredSessionId = ref<string | null>(null);

function formatDate(date: Date | string): string {
  const now = new Date();
  const sessionDate = date instanceof Date ? date : new Date(date);

  if (isNaN(sessionDate.getTime())) {
    return 'Recent';
  }

  const diffDays = Math.floor(
    (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return sessionDate.toLocaleDateString();
  }
}

const groupedSessions = computed(() => {
  const groups: Record<string, Session[]> = {};

  props.sessions.forEach((session) => {
    const dateKey = formatDate(session.updatedAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(session);
  });

  return groups;
});

function getVisibleCount(dateGroup: string): number {
  return visibleCounts.value[dateGroup] ?? INITIAL_CHATS_PER_DAY;
}

function getVisibleSessions(dateGroup: string, sessions: Session[]): Session[] {
  return sessions.slice(0, getVisibleCount(dateGroup));
}

function hasMore(dateGroup: string, sessions: Session[]): boolean {
  return getVisibleCount(dateGroup) < sessions.length;
}

function isExpanded(dateGroup: string): boolean {
  return getVisibleCount(dateGroup) > INITIAL_CHATS_PER_DAY;
}

function getRemainingCount(dateGroup: string, sessions: Session[]): number {
  return sessions.length - getVisibleCount(dateGroup);
}

function handleLoadMore(dateGroup: string, totalCount: number) {
  const current = getVisibleCount(dateGroup);
  visibleCounts.value[dateGroup] = Math.min(
    current + INITIAL_CHATS_PER_DAY,
    totalCount
  );
}

function handleShowLess(dateGroup: string) {
  visibleCounts.value[dateGroup] = INITIAL_CHATS_PER_DAY;
}

function handleDeleteSession(e: Event, sessionId: string) {
  e.stopPropagation();
  emit('deleteSession', sessionId);
}
</script>

<template>
  <!-- Collapsed State -->
  <div
    v-if="collapsed"
    class="w-12 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4"
  >
    <button
      class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 mb-4"
      title="Expand sidebar"
      @click="emit('toggleCollapse')"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
    <button
      class="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
      title="New chat"
      @click="emit('newSession')"
    >
      <Plus class="w-5 h-5" />
    </button>
  </div>

  <!-- Expanded State -->
  <div
    v-else
    class="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col"
  >
    <!-- Header -->
    <div
      class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
    >
      <h2 class="font-semibold text-gray-900 dark:text-white">Chat History</h2>
      <button
        class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        title="Collapse sidebar"
        @click="emit('toggleCollapse')"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
    </div>

    <!-- New Chat Button -->
    <div class="p-3">
      <button
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
        @click="emit('newSession')"
      >
        <Plus class="w-4 h-4" />
        New Chat
      </button>
    </div>

    <!-- Session List -->
    <div class="flex-1 overflow-y-auto px-2 pb-4">
      <!-- Empty State -->
      <div v-if="sessions.length === 0" class="text-center py-8 px-4">
        <div class="text-gray-400 mb-3 flex justify-center">
          <MessageSquare class="w-10 h-10" />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          No chat history yet. Start a new conversation!
        </p>
      </div>

      <!-- Grouped Sessions -->
      <template v-else>
        <div
          v-for="(groupSessions, dateGroup) in groupedSessions"
          :key="dateGroup"
          class="mb-4"
        >
          <!-- Date Header -->
          <div
            class="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            <Calendar class="w-3 h-3" />
            {{ dateGroup }}
          </div>

          <!-- Sessions -->
          <div class="space-y-1">
            <div
              v-for="session in getVisibleSessions(dateGroup, groupSessions)"
              :key="session.id"
              :class="[
                'group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                currentSessionId === session.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
              ]"
              @click="emit('selectSession', session.id)"
              @mouseenter="hoveredSessionId = session.id"
              @mouseleave="hoveredSessionId = null"
            >
              <MessageSquare class="w-4 h-4 flex-shrink-0" />
              <span class="flex-1 text-sm truncate">
                {{ session.title || 'New conversation' }}
              </span>
              <button
                v-if="
                  hoveredSessionId === session.id ||
                  currentSessionId === session.id
                "
                class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete chat"
                @click="handleDeleteSession($event, session.id)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Load More / Show Less -->
          <div
            v-if="hasMore(dateGroup, groupSessions) || isExpanded(dateGroup)"
            class="flex gap-2 mt-2"
          >
            <button
              v-if="hasMore(dateGroup, groupSessions)"
              class="flex-1 py-1.5 text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors flex items-center justify-center gap-1"
              @click="handleLoadMore(dateGroup, groupSessions.length)"
            >
              <ChevronDown class="w-3 h-3" />
              Load More ({{ getRemainingCount(dateGroup, groupSessions) }} more)
            </button>
            <button
              v-if="isExpanded(dateGroup)"
              class="flex-1 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center justify-center gap-1"
              @click="handleShowLess(dateGroup)"
            >
              <ChevronUp class="w-3 h-3" />
              Show Less
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
