import { ShieldAlert, CheckCircle, Info, X } from 'lucide-react';
import { useToast, type ToastMessage } from '../context/ToastContext';

export const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-10 left-0 right-0 z-[10000] flex flex-col items-center gap-3 px-6 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <ShieldAlert className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getTypeStyles = () => {
        switch (toast.type) {
            case 'success': return 'border-green-500/30 shadow-green-500/10';
            case 'error': return 'border-red-500/30 shadow-red-500/10';
            default: return 'border-blue-500/30 shadow-blue-500/10';
        }
    };

    return (
        <div 
            className={`
                pointer-events-auto flex items-center gap-4 px-5 py-4 min-w-[320px] max-w-md
                bg-surface/90 backdrop-blur-2xl border ${getTypeStyles()} 
                rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300
            `}
        >
            <div className="shrink-0">{getIcon()}</div>
            <p className="flex-1 text-[14px] font-bold text-white leading-tight">
                {toast.message}
            </p>
            <button 
                onClick={onRemove}
                className="shrink-0 p-1 hover:bg-white/10 rounded-full transition"
            >
                <X className="w-4 h-4 text-gray-500 hover:text-white" />
            </button>
        </div>
    );
};
