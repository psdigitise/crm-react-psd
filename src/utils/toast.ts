// Toast utility for displaying notifications
export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function showToast(message: string, options: ToastOptions = {}) {
  const {
    type = 'info',
    duration = 3000,
    position = 'top-right'
  } = options;

  // Create toast element
  const toast = document.createElement('div');
  toast.className = getToastClasses(type, position);
  toast.textContent = message;

  // Add to DOM
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('opacity-100', 'translate-y-0');
  }, 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', getExitTransform(position));
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
}

function getToastClasses(type: string, position: string): string {
  const baseClasses = [
    'fixed',
    'z-50',
    'px-4',
    'py-3',
    'rounded-lg',
    'shadow-lg',
    'text-white',
    'font-medium',
    'text-sm',
    'max-w-sm',
    'opacity-0',
    'transition-all',
    'duration-300',
    'ease-in-out'
  ];

  // Type-specific colors
  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };

  // Position-specific classes
  const positionClasses = {
    'top-right': 'top-4 right-4 translate-y-[200%]',
    'top-left': 'top-4 left-4 translate-y-[100%]',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2 translate-y-[-100%]',
    'bottom-right': 'bottom-4 right-4 translate-y-[100%]',
    'bottom-left': 'bottom-4 left-4 translate-y-[100%]',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 translate-y-[100%]'
  };

  return [
    ...baseClasses,
    typeClasses[type as keyof typeof typeClasses] || typeClasses.info,
    positionClasses[position as keyof typeof positionClasses] || positionClasses['top-right']
  ].join(' ');
}

function getExitTransform(position: string): string {
  const exitTransforms = {
    'top-right': 'translate-y-[-100%]',
    'top-left': 'translate-y-[-100%]',
    'top-center': 'translate-y-[-100%]',
    'bottom-right': 'translate-y-[100%]',
    'bottom-left': 'translate-y-[100%]',
    'bottom-center': 'translate-y-[100%]'
  };

  return exitTransforms[position as keyof typeof exitTransforms] || exitTransforms['top-right'];
}

// Convenience methods for different toast types
export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'success' }),
  
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'error' }),
  
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'warning' }),
  
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'info' })
};