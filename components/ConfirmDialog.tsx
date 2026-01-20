// ============================================
// RAM Dosya Atama - Confirmation Dialog
// User-friendly confirmation for critical actions
// ============================================

"use client";

import { useState, useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'warning',
  loading = false,
}: ConfirmDialogProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    if (loading) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleConfirm = () => {
    if (loading) return;
    onConfirm();
  };

  const variantStyles = {
    danger: {
      icon: '🗑️',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmText: 'text-white',
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100',
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
      confirmText: 'text-white',
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      confirmText: 'text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <>
      <div
        className={"fixed inset-0 bg-black/50 z-50 transition-opacity duration-200 " + (isClosing ? 'opacity-0' : 'opacity-100')}
        onClick={handleClose}
      />

      <div className={"fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 " + (isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100')}>
        <div
          className={"w-full max-w-md rounded-lg shadow-xl border p-6 " + styles.bgColor + " " + styles.borderColor}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={"flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl " + styles.iconBg}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {title}
              </h3>
              <p className="text-sm text-slate-600">
                {message}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={"px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 " + styles.confirmBg + " " + styles.confirmText}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'İşleniyor...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);

  const confirm = (action: () => void | Promise<void>) => {
    setPendingAction(() => action);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    
    setLoading(true);
    try {
      await pendingAction();
      setIsOpen(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
    setPendingAction(null);
  };

  return {
    isOpen,
    loading,
    confirm,
    handleConfirm,
    handleClose,
  };
}
