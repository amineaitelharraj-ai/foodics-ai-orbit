import type { Meta, StoryObj } from '@storybook/react';
import { FdxButton } from './FdxButton';

const meta: Meta<typeof FdxButton> = {
  title: 'Foodics/FdxButton',
  component: FdxButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'danger', 'link', 'text'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    children: 'Text Button',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};

export const WithIcons: Story = {
  args: {
    variant: 'primary',
    children: 'Download',
    startIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <FdxButton size="sm" variant="primary">Small</FdxButton>
      <FdxButton size="md" variant="primary">Medium</FdxButton>
      <FdxButton size="lg" variant="primary">Large</FdxButton>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <FdxButton variant="default">Default</FdxButton>
      <FdxButton variant="primary">Primary</FdxButton>
      <FdxButton variant="secondary">Secondary</FdxButton>
      <FdxButton variant="danger">Danger</FdxButton>
      <FdxButton variant="link">Link</FdxButton>
      <FdxButton variant="text">Text</FdxButton>
    </div>
  ),
};