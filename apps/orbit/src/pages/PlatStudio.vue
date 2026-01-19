<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Image,
  Sparkles,
  Settings,
  CheckCircle,
  Clock,
  Palette,
  BarChart3,
  Zap,
  Grid,
  List,
  X,
  AlertCircle,
} from 'lucide-vue-next';

type TabType = 'dashboard' | 'items' | 'batch' | 'library' | 'brand' | 'usage' | 'settings';
type ViewType = 'grid' | 'list';

interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  hasImage: boolean;
  imageUrl?: string;
  lastGenerated?: string;
  status: 'pending' | 'generated' | 'approved' | 'rejected';
}

interface GeneratedImage {
  id: string;
  itemId: string;
  itemName: string;
  url: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
  style: string;
}

const activeTab = ref<TabType>('dashboard');
const viewType = ref<ViewType>('grid');
const showGenerateModal = ref(false);
const generateProgress = ref(0);
const isGenerating = ref(false);
const selectedItems = ref<string[]>([]);
const filterCategory = ref('all');

const menuItems = ref<MenuItem[]>([
  { id: '1', name: 'Chicken Shawarma', nameAr: 'شاورما دجاج', category: 'Main Dishes', hasImage: true, imageUrl: '/api/placeholder/200/200', lastGenerated: '2024-01-15', status: 'approved' },
  { id: '2', name: 'Beef Burger', nameAr: 'برجر لحم', category: 'Burgers', hasImage: true, imageUrl: '/api/placeholder/200/200', lastGenerated: '2024-01-14', status: 'approved' },
  { id: '3', name: 'Caesar Salad', nameAr: 'سلطة سيزر', category: 'Salads', hasImage: false, status: 'pending' },
  { id: '4', name: 'French Fries', nameAr: 'بطاطس مقلية', category: 'Sides', hasImage: true, imageUrl: '/api/placeholder/200/200', lastGenerated: '2024-01-13', status: 'approved' },
  { id: '5', name: 'Hummus', nameAr: 'حمص', category: 'Appetizers', hasImage: false, status: 'pending' },
  { id: '6', name: 'Falafel', nameAr: 'فلافل', category: 'Main Dishes', hasImage: true, imageUrl: '/api/placeholder/200/200', lastGenerated: '2024-01-12', status: 'pending' },
  { id: '7', name: 'Lemonade', nameAr: 'عصير ليمون', category: 'Beverages', hasImage: false, status: 'pending' },
  { id: '8', name: 'Chocolate Cake', nameAr: 'كيك شوكولاتة', category: 'Desserts', hasImage: true, imageUrl: '/api/placeholder/200/200', lastGenerated: '2024-01-11', status: 'rejected' },
]);

const generatedImages = ref<GeneratedImage[]>([
  { id: '1', itemId: '1', itemName: 'Chicken Shawarma', url: '/api/placeholder/300/300', createdAt: '2024-01-15', status: 'approved', style: 'Professional' },
  { id: '2', itemId: '2', itemName: 'Beef Burger', url: '/api/placeholder/300/300', createdAt: '2024-01-14', status: 'approved', style: 'Rustic' },
  { id: '3', itemId: '4', itemName: 'French Fries', url: '/api/placeholder/300/300', createdAt: '2024-01-13', status: 'pending', style: 'Modern' },
  { id: '4', itemId: '6', itemName: 'Falafel', url: '/api/placeholder/300/300', createdAt: '2024-01-12', status: 'pending', style: 'Traditional' },
]);

const brandSettings = ref({
  primaryColor: '#7C3AED',
  secondaryColor: '#3B82F6',
  style: 'modern',
  backgroundPreference: 'neutral',
  lightingStyle: 'studio',
});

const usageStats = ref({
  totalGenerated: 156,
  monthlyQuota: 500,
  used: 156,
  remaining: 344,
  approvalRate: 87,
});

const generalSettings = ref({
  autoGenerate: false,
  notifyOnComplete: true,
  highResolution: true,
  watermark: false,
});

const tabs = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
  { id: 'items' as TabType, label: 'Menu Items', icon: Grid },
  { id: 'batch' as TabType, label: 'Batch Generate', icon: Zap },
  { id: 'library' as TabType, label: 'Image Library', icon: Image },
  { id: 'brand' as TabType, label: 'Brand Style', icon: Palette },
  { id: 'usage' as TabType, label: 'Usage', icon: BarChart3 },
  { id: 'settings' as TabType, label: 'Settings', icon: Settings },
];

const categories = computed(() => {
  const cats = [...new Set(menuItems.value.map((item) => item.category))];
  return ['all', ...cats];
});

const filteredItems = computed(() => {
  if (filterCategory.value === 'all') return menuItems.value;
  return menuItems.value.filter((item) => item.category === filterCategory.value);
});

const itemsWithImages = computed(() => menuItems.value.filter((item) => item.hasImage).length);
const coveragePercent = computed(() => Math.round((itemsWithImages.value / menuItems.value.length) * 100));

const handleGenerateImages = () => {
  if (selectedItems.value.length === 0) {
    alert('Please select items to generate images for');
    return;
  }
  showGenerateModal.value = true;
  isGenerating.value = true;
  generateProgress.value = 0;

  const interval = setInterval(() => {
    generateProgress.value += 10;
    if (generateProgress.value >= 100) {
      clearInterval(interval);
      isGenerating.value = false;
      setTimeout(() => {
        showGenerateModal.value = false;
        generateProgress.value = 0;
        alert(`Successfully generated images for ${selectedItems.value.length} items!`);
        selectedItems.value = [];
      }, 1000);
    }
  }, 500);
};

const toggleItemSelection = (itemId: string) => {
  const index = selectedItems.value.indexOf(itemId);
  if (index === -1) {
    selectedItems.value.push(itemId);
  } else {
    selectedItems.value.splice(index, 1);
  }
};

const selectAllItems = () => {
  const pendingItems = filteredItems.value.filter((item) => !item.hasImage);
  if (selectedItems.value.length === pendingItems.length) {
    selectedItems.value = [];
  } else {
    selectedItems.value = pendingItems.map((item) => item.id);
  }
};

const handleApproveImage = (imageId: string) => {
  const image = generatedImages.value.find((img) => img.id === imageId);
  if (image) {
    image.status = 'approved';
    alert('Image approved!');
  }
};

const handleRejectImage = (imageId: string) => {
  const image = generatedImages.value.find((img) => img.id === imageId);
  if (image) {
    image.status = 'rejected';
    alert('Image rejected. It will be regenerated.');
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles class="w-6 h-6 text-purple-600" />
          Plat Studio
        </h1>
        <p class="text-gray-600 dark:text-gray-400">AI-Powered Menu Image Generation</p>
      </div>
      <div class="flex items-center space-x-3">
        <button class="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2" @click="handleGenerateImages">
          <Sparkles class="w-4 h-4" />
          <span>Generate Images</span>
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex space-x-8 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap', activeTab === tab.id ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300']"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <!-- Coverage Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Menu Coverage</h3>
          <div class="flex items-center justify-center">
            <div class="relative w-32 h-32">
              <svg class="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none" class="text-gray-200 dark:text-gray-700" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none" class="text-purple-600" :stroke-dasharray="`${coveragePercent * 3.52} 352`" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ coveragePercent }}%</span>
              </div>
            </div>
          </div>
          <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            {{ itemsWithImages }} of {{ menuItems.length }} items have images
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">Generated This Month</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ usageStats.totalGenerated }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">Approval Rate</span>
              <span class="font-semibold text-green-600 dark:text-green-400">{{ usageStats.approvalRate }}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">Quota Remaining</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ usageStats.remaining }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Actions</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div class="flex items-center space-x-2">
                <Clock class="w-4 h-4 text-yellow-600" />
                <span class="text-sm text-gray-900 dark:text-white">Images to Review</span>
              </div>
              <span class="font-semibold text-yellow-600">{{ generatedImages.filter((img) => img.status === 'pending').length }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div class="flex items-center space-x-2">
                <AlertCircle class="w-4 h-4 text-red-600" />
                <span class="text-sm text-gray-900 dark:text-white">Items Without Images</span>
              </div>
              <span class="font-semibold text-red-600">{{ menuItems.filter((item) => !item.hasImage).length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div class="space-y-3">
          <div v-for="image in generatedImages.slice(0, 4)" :key="image.id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Image class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ image.itemName }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Generated {{ image.createdAt }}</p>
              </div>
            </div>
            <span
              :class="['px-2 py-1 text-xs rounded font-medium', image.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : image.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400']"
            >
              {{ image.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Tab -->
    <div v-if="activeTab === 'items'" class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <select v-model="filterCategory" class="input">
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat === 'all' ? 'All Categories' : cat }}
            </option>
          </select>
          <button class="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" @click="selectAllItems">
            {{ selectedItems.length === filteredItems.filter((item) => !item.hasImage).length ? 'Deselect All' : 'Select All Pending' }}
          </button>
        </div>
        <div class="flex items-center space-x-2">
          <button :class="['p-2 rounded-lg', viewType === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600']" @click="viewType = 'grid'">
            <Grid class="w-4 h-4" />
          </button>
          <button :class="['p-2 rounded-lg', viewType === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600']" @click="viewType = 'list'">
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewType === 'grid'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          :class="['bg-white dark:bg-gray-800 rounded-xl border overflow-hidden cursor-pointer transition-all', selectedItems.includes(item.id) ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300']"
          @click="toggleItemSelection(item.id)"
        >
          <div class="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
            <img v-if="item.hasImage" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
            <Image v-else class="w-12 h-12 text-gray-400" />
            <div v-if="selectedItems.includes(item.id)" class="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
              <CheckCircle class="w-4 h-4 text-white" />
            </div>
          </div>
          <div class="p-3">
            <h4 class="font-medium text-gray-900 dark:text-white text-sm truncate">{{ item.name }}</h4>
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ item.nameAr }}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-500">{{ item.category }}</span>
              <span
                :class="['px-2 py-0.5 text-xs rounded', item.hasImage ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400']"
              >
                {{ item.hasImage ? 'Has Image' : 'Pending' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewType === 'list'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="w-10 py-3 px-4"></th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Item</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Category</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Last Generated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              :class="['border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer', selectedItems.includes(item.id) ? 'bg-purple-50 dark:bg-purple-900/20' : '']"
              @click="toggleItemSelection(item.id)"
            >
              <td class="py-3 px-4">
                <div :class="['w-5 h-5 rounded border-2 flex items-center justify-center', selectedItems.includes(item.id) ? 'bg-purple-600 border-purple-600' : 'border-gray-300']">
                  <CheckCircle v-if="selectedItems.includes(item.id)" class="w-3 h-3 text-white" />
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    <img v-if="item.hasImage" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
                    <Image v-else class="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.name }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ item.nameAr }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.category }}</td>
              <td class="py-3 px-4">
                <span
                  :class="['px-2 py-1 text-xs rounded font-medium', item.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : item.status === 'pending' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400']"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.lastGenerated || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Library Tab -->
    <div v-if="activeTab === 'library'" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="image in generatedImages" :key="image.id" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="aspect-square bg-gray-100 dark:bg-gray-700 relative">
            <img :src="image.url" :alt="image.itemName" class="w-full h-full object-cover" />
            <div class="absolute top-2 right-2 flex space-x-1">
              <button class="p-1 bg-white dark:bg-gray-800 rounded shadow" @click="handleApproveImage(image.id)">
                <CheckCircle class="w-4 h-4 text-green-600" />
              </button>
              <button class="p-1 bg-white dark:bg-gray-800 rounded shadow" @click="handleRejectImage(image.id)">
                <X class="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
          <div class="p-3">
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">{{ image.itemName }}</h4>
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ image.style }} • {{ image.createdAt }}</p>
            <span
              :class="['mt-2 inline-block px-2 py-0.5 text-xs rounded', image.status === 'approved' ? 'bg-green-100 text-green-800' : image.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800']"
            >
              {{ image.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Brand Style Tab -->
    <div v-if="activeTab === 'brand'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Brand Style Settings</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
            <div class="flex items-center space-x-3">
              <input type="color" v-model="brandSettings.primaryColor" class="w-10 h-10 rounded cursor-pointer" />
              <input type="text" v-model="brandSettings.primaryColor" class="input flex-1" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Color</label>
            <div class="flex items-center space-x-3">
              <input type="color" v-model="brandSettings.secondaryColor" class="w-10 h-10 rounded cursor-pointer" />
              <input type="text" v-model="brandSettings.secondaryColor" class="input flex-1" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Style</label>
            <select v-model="brandSettings.style" class="input w-full">
              <option value="modern">Modern & Clean</option>
              <option value="rustic">Rustic & Warm</option>
              <option value="professional">Professional Studio</option>
              <option value="traditional">Traditional Arabic</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Preference</label>
            <select v-model="brandSettings.backgroundPreference" class="input w-full">
              <option value="neutral">Neutral</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="branded">Brand Colors</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lighting Style</label>
            <select v-model="brandSettings.lightingStyle" class="input w-full">
              <option value="studio">Studio Lighting</option>
              <option value="natural">Natural Light</option>
              <option value="dramatic">Dramatic</option>
              <option value="soft">Soft & Warm</option>
            </select>
          </div>
        </div>
        <button class="mt-6 btn bg-purple-600 hover:bg-purple-700 text-white">Save Brand Settings</button>
      </div>
    </div>

    <!-- Usage Tab -->
    <div v-if="activeTab === 'usage'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Usage</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-600 dark:text-gray-400">Images Generated</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ usageStats.used }} / {{ usageStats.monthlyQuota }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div class="bg-purple-600 h-3 rounded-full" :style="{ width: `${(usageStats.used / usageStats.monthlyQuota) * 100}%` }"></div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-6">
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ usageStats.remaining }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Remaining This Month</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ usageStats.approvalRate }}%</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div v-if="activeTab === 'settings'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Settings</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">Auto-Generate for New Items</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Automatically generate images when new menu items are added</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="generalSettings.autoGenerate" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">Notification on Complete</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Receive notifications when batch generation completes</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="generalSettings.notifyOnComplete" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">High Resolution Output</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Generate images at 2x resolution for print quality</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="generalSettings.highResolution" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">Add Watermark</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Add brand watermark to generated images</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="generalSettings.watermark" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Modal -->
    <Teleport to="body">
      <div v-if="showGenerateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generating Images</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Generating images for {{ selectedItems.length }} items...</p>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div class="bg-purple-600 h-3 rounded-full transition-all" :style="{ width: `${generateProgress}%` }"></div>
          </div>
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">{{ generateProgress }}% complete</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.input {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent;
}
</style>
