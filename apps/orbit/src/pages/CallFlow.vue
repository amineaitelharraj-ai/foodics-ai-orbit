<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Plus,
  Settings,
  Play,
  Pause,
  Save,
  Upload,
  Download,
  Eye,
  MessageSquare,
  FileText,
  Database,
  BarChart3,
  Clock,
  CheckCircle,
  Trash2,
  Copy,
  GitBranch,
  Zap,
  Target,
  Filter,
  Users,
} from 'lucide-vue-next';

interface FlowNode {
  id: string;
  type: 'greeting' | 'menu' | 'order' | 'payment' | 'confirmation' | 'escalation';
  title: string;
  content: string;
  position: { x: number; y: number };
  connections: string[];
}

interface DataSource {
  id: string;
  name: string;
  type: 'menu' | 'pricing' | 'policies' | 'faq';
  status: 'active' | 'training' | 'failed';
  accuracy: number;
  lastUpdate: string;
  size: string;
}

interface CallLog {
  id: string;
  time: string;
  customer: string;
  duration: string;
  status: 'completed' | 'escalated';
  order: string;
  total: string;
}

type TabType = 'designer' | 'sources' | 'analytics' | 'logs';

const activeTab = ref<TabType>('designer');
const selectedNode = ref<string | null>(null);
const isPlaying = ref(false);

const flowNodes: FlowNode[] = [
  {
    id: 'greeting',
    type: 'greeting',
    title: 'Welcome Greeting',
    content: 'مرحباً بكم في مطعم الأصالة، كيف يمكنني مساعدتكم اليوم؟',
    position: { x: 100, y: 100 },
    connections: ['menu'],
  },
  {
    id: 'menu',
    type: 'menu',
    title: 'Menu Navigation',
    content: 'هل تريدون الاطلاع على قائمة الطعام أم لديكم طلب محدد؟',
    position: { x: 400, y: 100 },
    connections: ['order', 'escalation'],
  },
  {
    id: 'order',
    type: 'order',
    title: 'Order Taking',
    content: 'ممتاز! ما هو طلبكم اليوم؟',
    position: { x: 700, y: 100 },
    connections: ['payment'],
  },
  {
    id: 'payment',
    type: 'payment',
    title: 'Payment Processing',
    content: 'المجموع ٤٥ ريال. هل تفضلون الدفع نقداً أم بالبطاقة؟',
    position: { x: 1000, y: 100 },
    connections: ['confirmation'],
  },
  {
    id: 'confirmation',
    type: 'confirmation',
    title: 'Order Confirmation',
    content: 'شكراً لكم! طلبكم سيكون جاهز خلال ١٥ دقيقة.',
    position: { x: 1300, y: 100 },
    connections: [],
  },
  {
    id: 'escalation',
    type: 'escalation',
    title: 'Human Handoff',
    content: 'سأقوم بتحويلكم إلى أحد زملائي للمساعدة.',
    position: { x: 400, y: 300 },
    connections: [],
  },
];

const dataSources: DataSource[] = [
  {
    id: 'menu-ar',
    name: 'Arabic Menu (قائمة الطعام)',
    type: 'menu',
    status: 'active',
    accuracy: 96,
    lastUpdate: '2 hours ago',
    size: '847 items',
  },
  {
    id: 'pricing',
    name: 'Current Pricing',
    type: 'pricing',
    status: 'active',
    accuracy: 98,
    lastUpdate: '1 day ago',
    size: '423 prices',
  },
  {
    id: 'policies',
    name: 'Store Policies',
    type: 'policies',
    status: 'training',
    accuracy: 87,
    lastUpdate: '3 days ago',
    size: '24 policies',
  },
  {
    id: 'faq-ar',
    name: 'Arabic FAQ',
    type: 'faq',
    status: 'failed',
    accuracy: 0,
    lastUpdate: 'Failed',
    size: '0 items',
  },
];

const callLogs: CallLog[] = [
  {
    id: '1',
    time: '14:35',
    customer: 'أحمد محمد',
    duration: '2:45',
    status: 'completed',
    order: 'شاورما دجاج + مشروب',
    total: '35 SR',
  },
  {
    id: '2',
    time: '14:32',
    customer: 'فاطمة علي',
    duration: '1:23',
    status: 'escalated',
    order: 'استفسار عن الحلويات',
    total: '--',
  },
  {
    id: '3',
    time: '14:28',
    customer: 'خالد أحمد',
    duration: '3:12',
    status: 'completed',
    order: 'مشكل مشترك لـ4 أشخاص',
    total: '125 SR',
  },
];

const tabs = [
  { id: 'designer' as TabType, label: 'Flow Designer', icon: GitBranch },
  { id: 'sources' as TabType, label: 'Data Sources', icon: Database },
  { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
  { id: 'logs' as TabType, label: 'Call Logs', icon: Clock },
];

const getNodeColor = (type: string): string => {
  const colors: Record<string, string> = {
    greeting: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    menu: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
    order: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
    payment: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
    confirmation: 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700',
    escalation: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
  };
  return colors[type] || 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700';
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'text-green-600 dark:text-green-400',
    training: 'text-yellow-600 dark:text-yellow-400',
    failed: 'text-red-600 dark:text-red-400',
    completed: 'text-green-600 dark:text-green-400',
    escalated: 'text-red-600 dark:text-red-400',
  };
  return colors[status] || 'text-gray-600 dark:text-gray-400';
};

const selectedNodeData = computed(() => flowNodes.find((n) => n.id === selectedNode.value));

const handlePlayFlow = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    alert('🎬 Simulating voice flow... Customer calling in Arabic');
    setTimeout(() => {
      alert('✅ Flow simulation complete! Customer successfully placed order for Chicken Shawarma.');
      isPlaying.value = false;
    }, 3000);
  }
};

const handleSaveFlow = () => {
  alert('💾 Call flow saved successfully! Changes will be applied to all voice channels.');
};

const handleUploadSource = () => {
  alert('📁 File upload dialog would open here. Supported: PDF, DOC, TXT for training data.');
};

const handleRetrain = (sourceId: string) => {
  alert(`🔄 Retraining AI model with updated ${sourceId} data. This will take 5-10 minutes.`);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Call Flow Designer</h1>
        <p class="text-gray-600 dark:text-gray-400">Design and optimize your voice ordering conversations</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          :class="[
            'btn flex items-center space-x-2',
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white',
          ]"
          @click="handlePlayFlow"
        >
          <Pause v-if="isPlaying" class="w-4 h-4" />
          <Play v-else class="w-4 h-4" />
          <span>{{ isPlaying ? 'Stop Test' : 'Test Flow' }}</span>
        </button>
        <button
          class="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          @click="handleSaveFlow"
        >
          <Save class="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          ]"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Designer Tab -->
    <div v-if="activeTab === 'designer'" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Flow Canvas -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Conversation Flow</h2>
          <div class="flex items-center space-x-2">
            <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Plus class="w-4 h-4" />
            </button>
            <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Copy class="w-4 h-4" />
            </button>
            <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Flow Visualization -->
        <div class="relative h-96 overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <svg class="absolute inset-0 w-full h-full">
            <template v-for="node in flowNodes" :key="node.id">
              <template v-for="targetId in node.connections" :key="`${node.id}-${targetId}`">
                <line
                  v-if="flowNodes.find((n) => n.id === targetId)"
                  :x1="node.position.x + 120"
                  :y1="node.position.y + 30"
                  :x2="flowNodes.find((n) => n.id === targetId)!.position.x"
                  :y2="flowNodes.find((n) => n.id === targetId)!.position.y + 30"
                  stroke="#8B5CF6"
                  stroke-width="2"
                  marker-end="url(#arrowhead)"
                />
              </template>
            </template>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#8B5CF6" />
              </marker>
            </defs>
          </svg>

          <!-- Flow Nodes -->
          <div
            v-for="node in flowNodes"
            :key="node.id"
            :class="[
              'absolute w-32 h-16 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg',
              getNodeColor(node.type),
              selectedNode === node.id ? 'ring-2 ring-purple-500' : '',
            ]"
            :style="{ left: `${node.position.x}px`, top: `${node.position.y}px` }"
            @click="selectedNode = node.id"
          >
            <div class="p-2 h-full flex flex-col justify-center">
              <div class="flex items-center space-x-1 mb-1">
                <MessageSquare v-if="node.type === 'greeting'" class="w-4 h-4" />
                <FileText v-else-if="node.type === 'menu'" class="w-4 h-4" />
                <Plus v-else-if="node.type === 'order'" class="w-4 h-4" />
                <Target v-else-if="node.type === 'payment'" class="w-4 h-4" />
                <CheckCircle v-else-if="node.type === 'confirmation'" class="w-4 h-4" />
                <Users v-else-if="node.type === 'escalation'" class="w-4 h-4" />
                <MessageSquare v-else class="w-4 h-4" />
                <span class="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {{ node.title }}
                </span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ node.content.substring(0, 30) }}...
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Node Properties Panel -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ selectedNode ? 'Edit Node' : 'Select a Node' }}
        </h3>

        <div v-if="selectedNodeData" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Node Title
            </label>
            <input
              type="text"
              :value="selectedNodeData.title"
              class="input w-full"
              placeholder="Enter node title"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice Script (Arabic/English)
            </label>
            <textarea
              :value="selectedNodeData.content"
              class="input w-full h-24 resize-none"
              placeholder="Enter what the AI should say..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Node Type
            </label>
            <select class="input w-full">
              <option value="greeting">Greeting</option>
              <option value="menu">Menu Navigation</option>
              <option value="order">Order Taking</option>
              <option value="payment">Payment</option>
              <option value="confirmation">Confirmation</option>
              <option value="escalation">Human Handoff</option>
            </select>
          </div>

          <div class="flex space-x-2">
            <button class="btn btn-primary flex-1">
              <Save class="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        <p v-else class="text-gray-500 dark:text-gray-400 text-sm">
          Click on a node in the flow to edit its properties and content.
        </p>
      </div>
    </div>

    <!-- Sources Tab -->
    <div v-if="activeTab === 'sources'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Training Data Sources</h2>
          <button
            class="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
            @click="handleUploadSource"
          >
            <Upload class="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="source in dataSources"
            :key="source.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    source.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : source.status === 'training'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20'
                        : 'bg-red-100 dark:bg-red-900/20',
                  ]"
                >
                  <Database :class="['w-4 h-4', getStatusColor(source.status)]" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ source.name }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ source.size }}</p>
                </div>
              </div>
              <div class="text-right">
                <div :class="['text-sm font-medium', getStatusColor(source.status)]">
                  {{
                    source.status === 'active'
                      ? `${source.accuracy}% accuracy`
                      : source.status === 'training'
                        ? 'Training...'
                        : 'Failed'
                  }}
                </div>
                <div class="text-xs text-gray-500">{{ source.lastUpdate }}</div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <button
                class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                @click="handleRetrain(source.id)"
              >
                Retrain
              </button>
              <button class="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">
                Download
              </button>
              <button
                v-if="source.status === 'failed'"
                class="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Fix
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Guidelines -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Guidelines</h3>

        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Supported Formats</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• PDF documents</li>
              <li>• Word files (.doc, .docx)</li>
              <li>• Text files (.txt)</li>
              <li>• Excel spreadsheets</li>
            </ul>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Best Practices</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Include Arabic and English text</li>
              <li>• Use clear, conversational language</li>
              <li>• Add common customer questions</li>
              <li>• Update pricing regularly</li>
            </ul>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">File Size Limits</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Maximum: 10MB per file</li>
              <li>• Total limit: 100MB</li>
              <li>• Recommended: Under 5MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Tab -->
    <div v-if="activeTab === 'analytics'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Flow Performance</h2>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">847</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Calls</div>
          </div>
          <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">94.2%</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2:34</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
          </div>
          <div class="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">5.8%</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Escalation Rate</div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="font-medium text-gray-900 dark:text-white">Node Performance</h3>
          <div
            v-for="node in flowNodes"
            :key="node.id"
            class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <MessageSquare v-if="node.type === 'greeting'" class="w-4 h-4" />
              <FileText v-else-if="node.type === 'menu'" class="w-4 h-4" />
              <Plus v-else-if="node.type === 'order'" class="w-4 h-4" />
              <Target v-else-if="node.type === 'payment'" class="w-4 h-4" />
              <CheckCircle v-else-if="node.type === 'confirmation'" class="w-4 h-4" />
              <Users v-else-if="node.type === 'escalation'" class="w-4 h-4" />
              <span class="font-medium text-gray-900 dark:text-white">{{ node.title }}</span>
            </div>
            <div class="flex items-center space-x-4 text-sm">
              <span class="text-gray-600 dark:text-gray-400">
                {{ Math.floor(Math.random() * 200 + 50) }} visits
              </span>
              <span class="text-green-600 dark:text-green-400">
                {{ Math.floor(Math.random() * 20 + 80) }}% success
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>

        <div class="space-y-3">
          <button class="w-full btn bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2">
            <Download class="w-4 h-4" />
            <span>Export Analytics</span>
          </button>

          <button class="w-full btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2">
            <Zap class="w-4 h-4" />
            <span>Optimize Flow</span>
          </button>

          <button class="w-full btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2">
            <Filter class="w-4 h-4" />
            <span>A/B Test</span>
          </button>

          <button class="w-full btn bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center space-x-2">
            <Settings class="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Logs Tab -->
    <div v-if="activeTab === 'logs'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Real-time Call Logs</h2>
        <div class="flex items-center space-x-2">
          <button class="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
            <Download class="w-4 h-4" />
            <span>Export</span>
          </button>
          <button class="btn bg-gray-600 hover:bg-gray-700 text-white">
            <Filter class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Time</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Customer</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Duration</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Order</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in callLogs"
              :key="log.id"
              class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="py-3 px-4 text-gray-900 dark:text-white">{{ log.time }}</td>
              <td class="py-3 px-4 text-gray-900 dark:text-white">{{ log.customer }}</td>
              <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ log.duration }}</td>
              <td class="py-3 px-4">
                <span :class="['px-2 py-1 text-xs rounded font-medium', getStatusColor(log.status)]">
                  {{ log.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-900 dark:text-white">{{ log.order }}</td>
              <td class="py-3 px-4 text-gray-900 dark:text-white font-medium">{{ log.total }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-1">
                  <button class="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <Eye class="w-4 h-4" />
                  </button>
                  <button class="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                    <Download class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}

.btn-ghost {
  @apply text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700;
}

.input {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent;
}
</style>
