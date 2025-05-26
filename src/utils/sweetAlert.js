import Swal from 'sweetalert2';

// Toast-like notifications (appears at top-right)
export const showToast = {
  success: (message, title = 'Succès') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
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
      confirmButtonColor: '#10B981'
    });
  },
  
  error: (message, title = 'Erreur') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#EF4444'
    });
  },
  
  warning: (message, title = 'Attention') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#F59E0B'
    });
  },
  
  info: (message, title = 'Information') => {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6'
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
      reverseButtons: true
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
      reverseButtons: true
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
      reverseButtons: true
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
export const showInput = {
  text: (title, placeholder = '', inputValue = '') => {
    return Swal.fire({
      title,
      input: 'text',
      inputPlaceholder: placeholder,
      inputValue,
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
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
    allowHtml: true
  });
};