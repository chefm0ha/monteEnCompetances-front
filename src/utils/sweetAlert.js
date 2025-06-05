import Swal from 'sweetalert2';

// Helper to determine if dark mode is enabled
const isDarkMode = () => {
  // Check for explicit theme setting in localStorage
  const storedTheme = localStorage.getItem("montecompetance-theme");
  
  if (storedTheme === "dark") return true;
  if (storedTheme === "light") return false;
  
  // If set to system or not set, check system preference
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Toast-like notifications (appears at top-right)
export const showToast = {  success: (message, title = 'Succès') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151',
      iconColor: isDarkMode() ? '#34d399' : '#10b981',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  },
  error: (message, title = 'Erreur') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151',
      iconColor: isDarkMode() ? '#f87171' : '#ef4444',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  },
  warning: (message, title = 'Attention') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151',
      iconColor: isDarkMode() ? '#fbbf24' : '#f59e0b',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  },
  info: (message, title = 'Information') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151', 
      iconColor: isDarkMode() ? '#60a5fa' : '#3b82f6',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }
};

// Alert-style notifications (centered modals)
export const showAlert = {
  success: (message, title = 'Succès') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#10B981',
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151'
    });
  },
    error: (message, title = 'Erreur') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#EF4444',
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151'
    });
  },
    warning: (message, title = 'Attention') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#F59E0B',
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151'
    });
  },
    info: (message, title = 'Information') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151'
    });
  }
};

// Confirmation dialogs
export const showConfirmation = {
  delete: (message = 'Cette action est irréversible.', title = 'Êtes-vous sûr ?') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151'
    });
  },
    action: (message, title = 'Confirmer l\'action', confirmText = 'Confirmer') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: confirmText,
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151'
    });
  },
    logout: () => {
    return Swal.fire({
      title: 'Se déconnecter ?',
      text: 'Vous allez être déconnecté de l\'application.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Se déconnecter',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151'
    });
  }
};

// Loading spinner
export const showLoading = (title = 'Chargement en cours...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: isDarkMode() ? '#1f2937' : '#ffffff',
    color: isDarkMode() ? '#f3f4f6' : '#374151',
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close any open Swal
export const closeSwal = () => {
  Swal.close();
};

// Input dialogs
export const showInput = {  text: (title, placeholder = '', inputValue = '') => {
    return Swal.fire({
      title,
      input: 'text',
      inputPlaceholder: placeholder,
      inputValue,
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151',
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez saisir une valeur !';
        }
      }
    });
  },
    textarea: (title, placeholder = '', inputValue = '') => {
    return Swal.fire({
      title,
      input: 'textarea',
      inputPlaceholder: placeholder,
      inputValue,
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      background: isDarkMode() ? '#1f2937' : '#ffffff',
      color: isDarkMode() ? '#f3f4f6' : '#374151',
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez saisir une valeur !';
        }
      }
    });
  }
};

// Progress dialog
export const showProgress = (title = 'Progression') => {
  return Swal.fire({
    title,
    html: `
      <div class="progress-container">
        <div class="progress-bar" style="width: 0%; height: 20px; background-color: #3B82F6; border-radius: 10px; transition: width 0.3s ease;"></div>
      </div>
      <p class="progress-text" style="margin-top: 10px;">0%</p>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      // Custom progress update function will be attached to the returned object
    }
  });
};

// Update progress (to be used with showProgress)
export const updateProgress = (percentage) => {
  const progressBar = Swal.getHtmlContainer()?.querySelector('.progress-bar');
  const progressText = Swal.getHtmlContainer()?.querySelector('.progress-text');
  
  if (progressBar && progressText) {
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
  }
};

// Custom styled alerts with HTML content
export const showCustomAlert = (title, html, icon = 'info') => {
  return Swal.fire({
    title,
    html,
    icon,
    confirmButtonText: 'OK',
    allowHtml: true,    background: isDarkMode() ? '#1f2937' : '#ffffff',
    color: isDarkMode() ? '#f3f4f6' : '#374151'
  });
};

// Listen for theme changes
if (typeof window !== 'undefined') {
  // Function to update SweetAlert's defaults based on current theme
  const updateSweetAlertDefaults = () => {
    const darkMode = isDarkMode();
    
    // Update SweetAlert defaults for theme
    Swal.defaultParams = {
      ...Swal.defaultParams,
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#374151'
    };
  };

  // Initialize defaults
  updateSweetAlertDefaults();
  
  // Watch for class changes on the html element
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class' && 
          (mutation.target.classList.contains('dark') || 
           !mutation.target.classList.contains('dark'))) {
        updateSweetAlertDefaults();
      }
    });
  });
  
  // Start observing the HTML element for class changes
  observer.observe(document.documentElement, { attributes: true });
  
  // Also watch for system preference changes
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (darkModeMediaQuery.addEventListener) {
    darkModeMediaQuery.addEventListener('change', updateSweetAlertDefaults);
  }
    // Watch for changes to the theme in localStorage
  window.addEventListener('storage', (event) => {
    if (event.key === 'montecompetance-theme' || event.key === 'montecompetance-theme-preference') {
      updateSweetAlertDefaults();
    }
  });
  
  // Listen for the custom themechange event
  window.addEventListener('themechange', () => {
    // Short timeout to ensure DOM updates have completed
    setTimeout(updateSweetAlertDefaults, 10);
  });
};