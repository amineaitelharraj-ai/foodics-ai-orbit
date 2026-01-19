<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Volume2,
  Phone,
  Smartphone,
  CheckCircle,
  CloudRain,
  Car,
  Pause,
  User,
  Users,
  MapPin,
  Languages,
  GitBranch,
  MessageSquare,
  FileText,
  Database,
  BarChart3,
  Plus,
  Target,
  Play,
  Save,
  Monitor,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-vue-next';

type TabType = 'dashboard' | 'callFlow' | 'voices' | 'analytics';

interface Channel {
  id: string;
  name: string;
  icon: typeof Phone;
  enabled: boolean;
  accuracy: number;
  orders: number;
  status: 'active' | 'inactive' | 'coming-soon';
}

interface ContextCard {
  type: string;
  icon: typeof CloudRain;
  title: string;
  description: string;
  suggestion: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface VoiceSample {
  text: string;
  translation: string;
}

interface VoicePersona {
  id: string;
  name: string;
  language: string;
  accent: string;
  branch: string;
  status: 'active' | 'training';
  orders: number;
  satisfaction: number;
  voiceType: string;
  speed: number;
  pitch: string;
  volume: number;
  samples: VoiceSample[];
}

interface FlowNode {
  id: string;
  type: 'greeting' | 'menu' | 'order' | 'payment' | 'confirmation' | 'escalation';
  title: string;
  content: string;
  position: { x: number; y: number };
  connections: string[];
}

const testingMic = ref(false);
const activeTab = ref<TabType>('dashboard');
const editingVoice = ref<string | null>(null);
const selectedNode = ref<string | null>(null);

const systemHealth = {
  uptime: 98,
  status: 'healthy',
  lastIncident: '2 days ago',
};

const todayMetrics = {
  voiceOrders: 847,
  accuracy: 94.2,
  avgCallTime: '2:34',
  revenue: 12450,
};

const channels = ref<Channel[]>([
  { id: 'phone', name: 'Phone', icon: Phone, enabled: true, accuracy: 94.2, orders: 847, status: 'active' },
  { id: 'drivethru', name: 'Drive-thru', icon: Car, enabled: true, accuracy: 91.8, orders: 623, status: 'active' },
  { id: 'kiosk', name: 'Kiosk', icon: Monitor, enabled: false, accuracy: 88.5, orders: 0, status: 'inactive' },
  { id: 'app', name: 'App', icon: Smartphone, enabled: false, accuracy: 0, orders: 0, status: 'coming-soon' },
]);

const contextCards: ContextCard[] = [
  { type: 'weather', icon: CloudRain, title: 'Rainy Day', description: 'Rain expected until 3PM', suggestion: 'Suggest soups & hot drinks', action: 'Enable soup prompts', priority: 'medium' },
  { type: 'traffic', icon: Car, title: 'High Traffic', description: 'Drive-thru queue: 8 cars', suggestion: 'Speed up upsell, offer pickup ETA', action: 'Adjust timing', priority: 'high' },
  { type: 'event', icon: Calendar, title: 'Game Night', description: 'Local match starts 7PM', suggestion: 'Prepare for dinner rush', action: 'Review staffing', priority: 'low' },
];

const voicePersonas = ref<VoicePersona[]>([
  { id: 'sarah', name: 'Sarah (Arabic)', language: 'Arabic Saudi', accent: 'Riyadh', branch: 'Main Branch', status: 'active', orders: 542, satisfaction: 96, voiceType: 'Neural', speed: 1.0, pitch: 'Medium', volume: 85, samples: [{ text: 'مرحباً بكم في مطعم الأصالة', translation: 'Welcome to Al-Asala Restaurant' }, { text: 'كيف يمكنني مساعدتكم اليوم؟', translation: 'How can I help you today?' }] },
  { id: 'ahmed', name: 'Ahmed (English)', language: 'English', accent: 'International', branch: 'Mall Branch', status: 'active', orders: 305, satisfaction: 94, voiceType: 'Standard', speed: 0.9, pitch: 'Low', volume: 90, samples: [{ text: 'Hello and welcome to our restaurant', translation: 'مرحباً ومرحباً بكم في مطعمنا' }] },
  { id: 'layla', name: 'Layla (Arabic)', language: 'Arabic Egyptian', accent: 'Cairo', branch: 'Downtown', status: 'training', orders: 0, satisfaction: 0, voiceType: 'Neural', speed: 1.1, pitch: 'High', volume: 80, samples: [{ text: 'أهلاً وسهلاً', translation: 'Welcome' }] },
  { id: 'omar', name: 'Omar (Mixed)', language: 'Arabic/English', accent: 'Bilingual', branch: 'Airport', status: 'active', orders: 156, satisfaction: 91, voiceType: 'Neural', speed: 0.95, pitch: 'Medium', volume: 88, samples: [{ text: 'Welcome - مرحباً بكم', translation: 'Welcome to our restaurant' }] },
]);

const flowNodes: FlowNode[] = [
  { id: 'greeting', type: 'greeting', title: 'Welcome Greeting', content: 'مرحباً بكم في مطعم الأصالة، كيف يمكنني مساعدتكم اليوم؟', position: { x: 100, y: 100 }, connections: ['menu'] },
  { id: 'menu', type: 'menu', title: 'Menu Navigation', content: 'هل تريدون الاطلاع على قائمة الطعام أم لديكم طلب محدد؟', position: { x: 400, y: 100 }, connections: ['order', 'escalation'] },
  { id: 'order', type: 'order', title: 'Order Taking', content: 'ممتاز! ما هو طلبكم اليوم؟', position: { x: 700, y: 100 }, connections: ['payment'] },
  { id: 'payment', type: 'payment', title: 'Payment Processing', content: 'المجموع ٤٥ ريال. هل تفضلون الدفع نقداً أم بالبطاقة؟', position: { x: 1000, y: 100 }, connections: ['confirmation'] },
  { id: 'confirmation', type: 'confirmation', title: 'Order Confirmation', content: 'شكراً لكم! طلبكم سيكون جاهز خلال ١٥ دقيقة.', position: { x: 1300, y: 100 }, connections: [] },
  { id: 'escalation', type: 'escalation', title: 'Human Handoff', content: 'سأقوم بتحويلكم إلى أحد زملائي للمساعدة.', position: { x: 400, y: 300 }, connections: [] },
];

const tabs = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
  { id: 'voices' as TabType, label: 'Voice Personas', icon: Users },
  { id: 'callFlow' as TabType, label: 'Call Flow', icon: GitBranch },
  { id: 'analytics' as TabType, label: 'Analytics', icon: Database },
];

const activeVoicePersonas = computed(() => voicePersonas.value.filter((p) => p.status === 'active'));

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

const handleTestMic = () => {
  testingMic.value = true;
  setTimeout(() => {
    testingMic.value = false;
    alert('Voice test complete! ✅ Microphone is working perfectly.');
  }, 3000);
};

const handleNotifyMe = () => {
  window.alert('You will be notified when the app is ready!');
};

const handleChannelToggle = (channelId: string) => {
  const channel = channels.value.find((c) => c.id === channelId);
  if (channel && channel.status !== 'coming-soon') {
    channel.enabled = !channel.enabled;
    channel.status = channel.enabled ? 'active' : 'inactive';
    alert(`${channel.name} channel ${channel.enabled ? 'enabled' : 'disabled'} successfully!`);
  }
};

const handleContextAction = (action: string) => {
  alert(`${action} action executed successfully!`);
};

const playVoiceSample = (persona: VoicePersona, sampleIndex: number) => {
  testingMic.value = true;
  const sample = persona.samples[sampleIndex];
  if (sample) {
    window.alert(`Playing voice sample: ${sample.text}`);
  }
  setTimeout(() => {
    testingMic.value = false;
  }, 2000);
};

const handleActivatePersona = (personaId: string) => {
  const persona = voicePersonas.value.find((p) => p.id === personaId);
  if (persona) {
    alert(`${persona.name} activated successfully! Voice ordering is now live.`);
  }
};

const saveVoiceSettings = (_personaId: string) => {
  editingVoice.value = null;
  window.alert('Voice settings saved successfully!');
};

const editingVoiceData = computed(() => voicePersonas.value.find((p) => p.id === editingVoice.value));
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Say and Serve</h1>
        <p class="text-gray-600 dark:text-gray-400">AI Voice Ordering System</p>
      </div>
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span class="text-sm font-medium text-green-700 dark:text-green-400">{{ systemHealth.uptime }}% Uptime</span>
        </div>
        <button
          :class="['btn flex items-center space-x-2', testingMic ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white']"
          @click="handleTestMic"
        >
          <Pause v-if="testingMic" class="w-4 h-4" />
          <Play v-else class="w-4 h-4" />
          <span>{{ testingMic ? 'Stop Test' : 'Test Voice' }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm', activeTab === tab.id ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300']"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <!-- Today's Metrics -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today at a Glance</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ todayMetrics.voiceOrders }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Orders via voice</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ todayMetrics.accuracy }}%</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Avg accuracy</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ todayMetrics.avgCallTime }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Median call time</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">${{ todayMetrics.revenue.toLocaleString() }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
          </div>
        </div>
      </div>

      <!-- Voice Channels and Smart Context -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Voice Channels -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Volume2 class="w-5 h-5 mr-2 text-blue-600" />
            Voice Channels
          </h2>
          <div class="space-y-3">
            <div
              v-for="channel in channels"
              :key="channel.id"
              class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center">
                <div
                  :class="['w-10 h-10 rounded-lg flex items-center justify-center mr-3', channel.enabled ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : channel.status === 'coming-soon' ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400']"
                >
                  <component :is="channel.icon" class="w-5 h-5" />
                </div>
                <div>
                  <div class="flex items-center">
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ channel.name }}</h3>
                    <span v-if="channel.status === 'coming-soon'" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Coming Soon</span>
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ channel.enabled ? `${channel.accuracy}% accuracy • ${channel.orders} orders` : channel.status === 'coming-soon' ? 'Notify when ready' : 'Ready to enable' }}
                  </div>
                </div>
              </div>
              <label v-if="channel.status !== 'coming-soon'" class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" :checked="channel.enabled" class="sr-only peer" @change="handleChannelToggle(channel.id)" />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              <button v-else class="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline" @click="handleNotifyMe">
                Notify Me
              </button>
            </div>
          </div>
        </div>

        <!-- Smart Context -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Smart Context</h2>
          <div class="space-y-3">
            <div
              v-for="(card, index) in contextCards"
              :key="index"
              :class="['border rounded-lg p-3', card.priority === 'high' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : card.priority === 'medium' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700']"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start">
                  <component
                    :is="card.icon"
                    :class="['w-5 h-5 mr-3 mt-0.5', card.priority === 'high' ? 'text-red-600' : card.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600']"
                  />
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900 dark:text-white text-sm">{{ card.title }}</h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">{{ card.description }}</p>
                    <p class="text-xs text-blue-800 dark:text-blue-200">{{ card.suggestion }}</p>
                  </div>
                </div>
                <button
                  :class="['text-xs px-2 py-1 rounded font-medium hover:opacity-90 transition-opacity', card.priority === 'high' ? 'bg-red-600 text-white' : card.priority === 'medium' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white']"
                  @click="handleContextAction(card.action)"
                >
                  {{ card.action }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Voices Tab -->
    <div v-if="activeTab === 'voices'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voice Agents by Branch</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="persona in voicePersonas" :key="persona.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center mr-3', persona.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20']">
                  <User :class="['w-5 h-5', persona.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400']" />
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white text-sm">{{ persona.name }}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                    <Languages class="w-3 h-3 mr-1" />
                    {{ persona.language }} • {{ persona.accent }}
                  </div>
                </div>
              </div>
              <span :class="['px-2 py-1 text-xs rounded font-medium', persona.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400']">
                {{ persona.status }}
              </span>
            </div>

            <div class="mb-3">
              <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">Voice Samples:</div>
              <div class="space-y-1">
                <div v-for="(sample, index) in persona.samples.slice(0, 2)" :key="index" class="flex items-center justify-between text-xs">
                  <span class="text-gray-900 dark:text-white truncate mr-2">"{{ sample.text }}"</span>
                  <button class="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400" @click="playVoiceSample(persona, index)">
                    <Play class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin class="w-3 h-3 mr-1" />
                {{ persona.branch }}
              </div>
              <div class="flex items-center space-x-2">
                <button class="text-blue-600 dark:text-blue-400 hover:underline" @click="editingVoice = persona.id">
                  Edit Voice
                </button>
                <button v-if="persona.status === 'training'" class="text-green-600 dark:text-green-400 hover:underline" @click="handleActivatePersona(persona.id)">
                  Activate
                </button>
              </div>
            </div>

            <div class="mt-2 text-xs text-right text-gray-500">
              <template v-if="persona.status === 'active'">
                <span class="font-medium">{{ persona.orders }} orders</span>
                <span class="mx-1">•</span>
                <span>{{ persona.satisfaction }}% satisfaction</span>
              </template>
              <span v-else>Ready for activation</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Editor Modal -->
      <Teleport to="body">
        <div v-if="editingVoice && editingVoiceData" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit {{ editingVoiceData.name }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Voice Type</label>
                <select class="input w-full">
                  <option value="Neural">Neural (Premium)</option>
                  <option value="Standard">Standard</option>
                  <option value="Custom">Custom Trained</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Speaking Speed: {{ editingVoiceData.speed }}x</label>
                <input type="range" min="0.5" max="2" step="0.1" :value="editingVoiceData.speed" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pitch</label>
                <select class="input w-full">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Volume: {{ editingVoiceData.volume }}%</label>
                <input type="range" min="50" max="100" :value="editingVoiceData.volume" class="w-full" />
              </div>
              <div class="flex space-x-3 pt-4">
                <button class="btn btn-primary flex-1" @click="saveVoiceSettings(editingVoiceData.id)">Save Changes</button>
                <button class="btn btn-ghost flex-1" @click="editingVoice = null">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Call Flow Tab -->
    <div v-if="activeTab === 'callFlow'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Conversation Flow Designer</h2>
          <div class="flex items-center space-x-2">
            <button class="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2">
              <Play class="w-4 h-4" />
              <span>Test Flow</span>
            </button>
            <button class="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
              <Save class="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        <!-- Flow Canvas -->
        <div class="relative h-96 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
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
            :class="['absolute w-32 h-16 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg', getNodeColor(node.type), selectedNode === node.id ? 'ring-2 ring-purple-500' : '']"
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
                <span class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ node.title }}</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{{ node.content.substring(0, 30) }}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Tab -->
    <div v-if="activeTab === 'analytics'" class="space-y-6">
      <!-- Performance Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Voice Orders</p>
              <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">2,847</p>
              <p class="text-sm text-green-600 dark:text-green-400">+12% from last week</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Volume2 class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy Rate</p>
              <p class="text-3xl font-bold text-green-600 dark:text-green-400">94.2%</p>
              <p class="text-sm text-green-600 dark:text-green-400">+2.1% improvement</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Target class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Call Time</p>
              <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">2:34</p>
              <p class="text-sm text-red-600 dark:text-red-400">+0:12 vs target</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Clock class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue Generated</p>
              <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">$67,420</p>
              <p class="text-sm text-green-600 dark:text-green-400">+18% vs last month</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <DollarSign class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Persona Performance -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voice Persona Performance</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="persona in activeVoicePersonas" :key="persona.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                  <User class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ persona.name }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ persona.branch }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ persona.satisfaction }}%</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">satisfaction</div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-600 dark:text-gray-400">Orders Handled</div>
                <div class="font-semibold text-gray-900 dark:text-white">{{ persona.orders }}</div>
              </div>
              <div>
                <div class="text-gray-600 dark:text-gray-400">Revenue</div>
                <div class="font-semibold text-gray-900 dark:text-white">${{ (persona.orders * 24.2).toLocaleString() }}</div>
              </div>
            </div>

            <div class="mt-3">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 dark:text-gray-400">Performance</span>
                <span class="text-gray-900 dark:text-white">{{ persona.satisfaction }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" :style="{ width: `${persona.satisfaction}%` }"></div>
              </div>
            </div>
          </div>
        </div>
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
