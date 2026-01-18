<script setup lang="ts">
import { ref } from 'vue';
import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-vue-next';

interface FAQItem {
  question: string;
  answer: string;
}

const expandedFAQ = ref<number | null>(null);

const faqs: FAQItem[] = [
  {
    question: 'How do I get started with Orbit AI Assistant?',
    answer:
      'Simply type your question or request in the chat input at the bottom of the Assistant page. The AI will understand natural language and help you with tasks like viewing products, managing inventory, checking sales, and more.',
  },
  {
    question: 'What can the AI Assistant help me with?',
    answer:
      'The AI Assistant can help you with a variety of tasks including: viewing and managing products, categories, and inventory; checking sales trends and business metrics; managing customers and loyalty programs; and creating promotions and discounts.',
  },
  {
    question: 'How do I approve or reject AI actions?',
    answer:
      'When the AI wants to make changes to your data, it will show you a preview card with the details. You can review the changes and click "Approve" to proceed or "Reject" to cancel the action.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, your data is encrypted in transit and at rest. The AI Assistant only accesses data that you have permission to view, and all actions are logged for your records.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can reach our support team via email at support@foodics.com or through the live chat option below. Our team is available 24/7 to assist you.',
  },
];

function toggleFAQ(index: number) {
  expandedFAQ.value = expandedFAQ.value === index ? null : index;
}

const supportLinks = [
  {
    title: 'Documentation',
    description: 'Browse our comprehensive guides and tutorials',
    icon: Book,
    href: 'https://help.foodics.com',
  },
  {
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    icon: MessageCircle,
    href: '#',
  },
  {
    title: 'Email Support',
    description: 'Send us an email and we\'ll respond within 24 hours',
    icon: Mail,
    href: 'mailto:support@foodics.com',
  },
];
</script>

<template>
  <div class="h-full overflow-y-auto p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Help & Support
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Get help with Orbit and find answers to common questions
        </p>
      </div>

      <!-- Support Options -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <a
          v-for="link in supportLinks"
          :key="link.title"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group"
        >
          <div
            class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg w-fit mb-4"
          >
            <component
              :is="link.icon"
              class="w-6 h-6 text-primary-600 dark:text-primary-400"
            />
          </div>
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ link.title }}
            </h3>
            <ExternalLink
              class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ link.description }}
          </p>
        </a>
      </div>

      <!-- FAQ Section -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <HelpCircle class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="(faq, index) in faqs" :key="index" class="p-6">
            <button
              class="w-full flex items-center justify-between text-left"
              @click="toggleFAQ(index)"
            >
              <span class="font-medium text-gray-900 dark:text-white pr-4">
                {{ faq.question }}
              </span>
              <ChevronUp
                v-if="expandedFAQ === index"
                class="w-5 h-5 text-gray-400 flex-shrink-0"
              />
              <ChevronDown
                v-else
                class="w-5 h-5 text-gray-400 flex-shrink-0"
              />
            </button>
            <div
              v-if="expandedFAQ === index"
              class="mt-4 text-gray-600 dark:text-gray-400"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
