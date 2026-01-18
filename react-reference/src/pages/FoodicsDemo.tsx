import React, { useState } from 'react';
import { 
  FdxButton, 
  FdxCard, 
  FdxCardHeader, 
  FdxCardContent, 
  FdxCardFooter,
  FdxInputText,
  FdxAlert,
  FdxAvatar,
  FdxModal
} from '@/components/foodics/ui';

const FoodicsDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAsyncAction = async () => {
    setLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setCount(prev => prev + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Simple validation
    if (value.length < 3 && value.length > 0) {
      setInputError('Input must be at least 3 characters');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--fdx-gray-900)] mb-4">
            Foodics UI Components
          </h1>
          <p className="text-lg text-[var(--fdx-gray-600)]">
            Professional React implementation of Foodics design system
          </p>
          <p className="text-sm text-[var(--fdx-gray-500)] mt-2">
            Featuring minimal design, professional color palette, and clean typography
          </p>
        </div>

        {/* Button Variants Section */}
        <div className="bg-white rounded-[var(--fdx-radius-xl)] shadow-[var(--fdx-shadow-sm)] border border-[var(--fdx-gray-200)] p-8 mb-8">
          <h2 className="text-2xl font-semibold text-[var(--fdx-gray-900)] mb-6">FdxButton Variants</h2>
          
          <div className="space-y-6">
            {/* Basic Variants */}
            <div>
              <h3 className="text-lg font-medium text-[var(--fdx-gray-700)] mb-4">Basic Variants</h3>
              <div className="flex flex-wrap gap-3">
                <FdxButton variant="default">Default</FdxButton>
                <FdxButton variant="primary">Primary</FdxButton>
                <FdxButton variant="secondary">Secondary</FdxButton>
                <FdxButton variant="danger">Danger</FdxButton>
                <FdxButton variant="link">Link</FdxButton>
                <FdxButton variant="text">Text</FdxButton>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Sizes</h3>
              <div className="flex items-center gap-3">
                <FdxButton size="sm" variant="primary">Small</FdxButton>
                <FdxButton size="md" variant="primary">Medium</FdxButton>
                <FdxButton size="lg" variant="primary">Large</FdxButton>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">States</h3>
              <div className="flex flex-wrap gap-3">
                <FdxButton variant="primary" disabled>Disabled</FdxButton>
                <FdxButton 
                  variant="primary" 
                  loading={loading}
                  onClick={handleAsyncAction}
                >
                  {loading ? 'Loading...' : `Clicked ${count} times`}
                </FdxButton>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <FdxButton 
                  variant="primary"
                  startIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  }
                >
                  Download
                </FdxButton>
                
                <FdxButton 
                  variant="secondary"
                  endIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  }
                >
                  Next
                </FdxButton>

                <FdxButton 
                  variant="danger"
                  startIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                    </svg>
                  }
                >
                  Delete
                </FdxButton>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Example */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Interactive Example</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Click the button below to test the loading state:
            </p>
            
            <div className="flex items-center gap-4">
              <FdxButton 
                variant="primary" 
                size="lg"
                loading={loading}
                onClick={handleAsyncAction}
                startIcon={!loading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ) : undefined}
              >
                {loading ? 'Processing...' : `Awesome Action (${count})`}
              </FdxButton>
              
              <span className="text-sm text-gray-500">
                {count > 0 && `Success! Completed ${count} time${count > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>

        {/* Alert Component */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">FdxAlert Component</h2>
          
          <div className="space-y-4">
            {alertVisible && (
              <FdxAlert 
                variant="info" 
                title="Information Alert"
                dismissible
                onDismiss={() => setAlertVisible(false)}
              >
                This is an informational alert that can be dismissed.
              </FdxAlert>
            )}
            
            <FdxAlert variant="success" title="Success!">
              Your action was completed successfully.
            </FdxAlert>
            
            <FdxAlert variant="warning" bordered>
              This is a warning message with borders.
            </FdxAlert>
            
            <FdxAlert variant="error" size="lg">
              This is an error alert with large size.
            </FdxAlert>

            {!alertVisible && (
              <FdxButton 
                variant="secondary" 
                size="sm"
                onClick={() => setAlertVisible(true)}
              >
                Restore Dismissed Alert
              </FdxButton>
            )}
          </div>
        </div>

        {/* Card Component */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">FdxCard Component</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FdxCard variant="default" hoverable>
              <FdxCardHeader 
                title="Default Card"
                subtitle="With hover effect"
                actions={
                  <FdxButton size="sm" variant="text">Edit</FdxButton>
                }
              />
              <FdxCardContent>
                This is a default card with some content and a hover effect.
              </FdxCardContent>
            </FdxCard>

            <FdxCard variant="bordered" clickable>
              <FdxCardHeader title="Bordered Card" />
              <FdxCardContent>
                This card has a thicker border and is clickable.
              </FdxCardContent>
              <FdxCardFooter>
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm text-gray-500">Footer content</span>
                  <FdxButton size="sm" variant="primary">Action</FdxButton>
                </div>
              </FdxCardFooter>
            </FdxCard>

            <FdxCard variant="elevated" padding="lg">
              <FdxCardHeader title="Elevated Card" />
              <FdxCardContent>
                This card has a shadow elevation effect and larger padding.
              </FdxCardContent>
            </FdxCard>
          </div>
        </div>

        {/* Input Component */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">FdxInputText Component</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FdxInputText
                label="Name"
                placeholder="Enter your name"
                value={inputValue}
                onChange={handleInputChange}
                error={!!inputError}
                errorMessage={inputError}
                helpText="Minimum 3 characters required"
                required
              />
              
              <FdxInputText
                label="Email"
                type="email"
                placeholder="your@email.com"
                startIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                }
              />
              
              <FdxInputText
                variant="filled"
                label="Search"
                placeholder="Search..."
                endIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                }
              />
            </div>
            
            <div className="space-y-4">
              <FdxInputText
                variant="underlined"
                label="Underlined Input"
                placeholder="Clean underlined style"
              />
              
              <FdxInputText
                size="lg"
                placeholder="Large size input"
                disabled
                value="Disabled input"
              />
              
              <FdxInputText
                loading
                placeholder="Loading state..."
                value="Processing..."
              />
            </div>
          </div>
        </div>

        {/* Avatar Component */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">FdxAvatar Component</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Sizes</h3>
              <div className="flex items-center gap-4">
                <FdxAvatar size="xs" name="John Doe" />
                <FdxAvatar size="sm" name="Jane Smith" />
                <FdxAvatar size="md" name="Bob Wilson" />
                <FdxAvatar size="lg" name="Alice Brown" />
                <FdxAvatar size="xl" name="Charlie Davis" />
                <FdxAvatar size="2xl" name="Diana Miller" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">With Images</h3>
              <div className="flex items-center gap-4">
                <FdxAvatar 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  name="John Doe"
                  size="lg"
                />
                <FdxAvatar 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612c5ab?w=100&h=100&fit=crop&crop=face"
                  name="Jane Smith"
                  size="lg"
                  bordered
                />
                <FdxAvatar 
                  src="invalid-url"
                  name="Fallback User"
                  size="lg"
                />
                <FdxAvatar size="lg" loading />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Shapes</h3>
              <div className="flex items-center gap-4">
                <FdxAvatar name="Circle" shape="circle" size="lg" />
                <FdxAvatar name="Rounded" shape="rounded" size="lg" />
                <FdxAvatar name="Square" shape="square" size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Component */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">FdxModal Component</h2>
          
          <div className="flex gap-4">
            <FdxButton 
              variant="primary"
              onClick={() => setModalOpen(true)}
            >
              Open Modal
            </FdxButton>
          </div>

          <FdxModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            size="lg"
            footer={
              <div className="flex gap-3">
                <FdxButton 
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </FdxButton>
                <FdxButton 
                  variant="primary"
                  onClick={() => {
                    alert('Confirmed!');
                    setModalOpen(false);
                  }}
                >
                  Confirm
                </FdxButton>
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                This is a modal dialog built with the FdxModal component. It supports:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Portal rendering for proper z-index layering</li>
                <li>Backdrop click to close (configurable)</li>
                <li>Escape key to close (configurable)</li>
                <li>Multiple sizes (sm, md, lg, xl, full)</li>
                <li>Custom headers and footers</li>
                <li>Proper focus management</li>
                <li>Body scroll locking when open</li>
              </ul>
              
              <div className="mt-6">
                <FdxInputText
                  label="Test Input"
                  placeholder="You can interact with form elements"
                />
              </div>
            </div>
          </FdxModal>
        </div>

        {/* Summary */}
        <div className="bg-[var(--fdx-success-50)] rounded-[var(--fdx-radius-xl)] border border-[var(--fdx-success-200)] p-8 mt-8">
          <h2 className="text-2xl font-semibold text-[var(--fdx-success-900)] mb-4">🎉 Professional Foodics Components</h2>
          <p className="text-[var(--fdx-success-800)] mb-4">
            Successfully built professional React components with Foodics design system:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[var(--fdx-success-800)]">
            <ul className="space-y-2">
              <li>✅ <strong>FdxButton</strong> - Professional styling, minimal colors</li>
              <li>✅ <strong>FdxCard</strong> - Clean shadows, subtle borders</li>
              <li>✅ <strong>FdxInputText</strong> - Refined focus states, validation</li>
            </ul>
            <ul className="space-y-2">
              <li>✅ <strong>FdxAlert</strong> - Consistent status colors</li>
              <li>✅ <strong>FdxAvatar</strong> - Brand-aligned color palette</li>
              <li>✅ <strong>FdxModal</strong> - Professional backdrop, typography</li>
            </ul>
          </div>
          <p className="text-[var(--fdx-success-800)] mt-4">
            Features: Professional color system, Inter font family, CSS custom properties, minimal shadows!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FoodicsDemo;