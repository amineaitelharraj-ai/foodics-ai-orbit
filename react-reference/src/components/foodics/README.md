# Foodics UI Components - React Implementation

React + TypeScript implementation of Foodics design system components, based on the Vue 3 components from [storybook.foodicspay.dev](https://storybook.foodicspay.dev).

## 🚀 Components Available

### ✅ FdxButton
- **6 Variants**: `default`, `primary`, `secondary`, `danger`, `link`, `text`
- **3 Sizes**: `sm`, `md`, `lg`
- **Features**: Loading states, start/end icons, full accessibility
- **Usage**: `<FdxButton variant="primary" loading={isLoading}>Submit</FdxButton>`

### ✅ FdxCard
- **4 Variants**: `default`, `bordered`, `elevated`, `outline`
- **4 Padding Sizes**: `none`, `sm`, `md`, `lg`
- **Features**: Hoverable, clickable, header/content/footer composition
- **Usage**: 
```tsx
<FdxCard variant="elevated" hoverable>
  <FdxCardHeader title="Card Title" subtitle="Subtitle" />
  <FdxCardContent>Content goes here</FdxCardContent>
  <FdxCardFooter>Footer content</FdxCardFooter>
</FdxCard>
```

### ✅ FdxInputText
- **3 Variants**: `default`, `filled`, `underlined`
- **3 Sizes**: `sm`, `md`, `lg`
- **Features**: Labels, validation, error states, start/end icons, loading states
- **Usage**: 
```tsx
<FdxInputText
  label="Email"
  error={!!error}
  errorMessage={error}
  startIcon={<EmailIcon />}
  required
/>
```

### ✅ FdxAlert
- **4 Types**: `info`, `success`, `warning`, `error`
- **3 Sizes**: `sm`, `md`, `lg`
- **Features**: Dismissible, bordered, custom icons, titles
- **Usage**: 
```tsx
<FdxAlert 
  variant="success" 
  title="Success!" 
  dismissible 
  onDismiss={handleDismiss}
>
  Your action was completed.
</FdxAlert>
```

### ✅ FdxAvatar
- **6 Sizes**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- **3 Shapes**: `circle`, `rounded`, `square`
- **Features**: Image fallbacks, initials generation, color variants, loading states
- **Usage**: 
```tsx
<FdxAvatar 
  src={userImage} 
  name="John Doe" 
  size="lg" 
  bordered 
/>
```

### ✅ FdxModal
- **5 Sizes**: `sm`, `md`, `lg`, `xl`, `full`
- **Features**: Portal rendering, backdrop/escape closing, body scroll lock, accessibility
- **Usage**: 
```tsx
<FdxModal
  open={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="lg"
  footer={<>Footer content</>}
>
  Modal content
</FdxModal>
```

## 🎨 Features

- **TypeScript**: Full type definitions for all components
- **Accessibility**: ARIA attributes, keyboard navigation, focus management
- **Dark Mode**: Complete dark mode support via Tailwind CSS
- **Responsive**: Mobile-first design with responsive breakpoints
- **Customizable**: Easy to customize via Tailwind CSS classes
- **Tree-shakeable**: Import only the components you need

## 📦 Usage

```tsx
import { 
  FdxButton, 
  FdxCard, 
  FdxInputText, 
  FdxAlert, 
  FdxAvatar, 
  FdxModal 
} from '@/components/foodics/ui';
```

## 🎯 Demo

Visit `/foodics-demo` in your application to see all components in action with interactive examples.

## 🔮 Roadmap

Based on the complete Foodics Storybook catalog, additional components that can be implemented:

- **Form Controls**: FdxInputPassword, FdxInputNumber, FdxInputDate, FdxInputSelect, FdxTextarea, FdxSwitch, FdxInputCheckbox
- **Navigation**: FdxTabs, FdxDropdown, FdxBreadcrumb
- **Data Display**: FdxTable, FdxTimeline, FdxTooltip
- **Feedback**: FdxToaster, FdxLoadingSpinner
- **Layout**: FdxDrawer, FdxCollapsible

## 🛠 Development

All components follow the Foodics design system guidelines and maintain feature parity with the original Vue 3 implementations.