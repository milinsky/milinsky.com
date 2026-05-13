export function eeShowToast(message, duration) {
    const toast = document.createElement('div');
    toast.className = 'ee-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('ee-toast--visible');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('ee-toast--visible');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration || 3000);
}
