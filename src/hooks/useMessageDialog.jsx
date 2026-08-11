import { useCallback, useRef, useState } from 'react';
import MessageDialog from '../components/MessageDialog.jsx';

export function useMessageDialog() {
  const [dialogState, setDialogState] = useState(null);
  const resolverRef = useRef(null);

  const closeDialog = useCallback((result = false) => {
    setDialogState(null);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const openDialog = useCallback((options) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setDialogState(options);
  }), []);

  const showMessage = useCallback(({
    title = 'Notice',
    message,
    variant = 'info',
    confirmLabel = 'OK',
  }) => openDialog({
    title,
    message,
    variant,
    confirmLabel,
    showCancel: false,
  }).then(() => true), [openDialog]);

  const showConfirm = useCallback(({
    title = 'Confirm',
    message,
    variant = 'confirm',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
  }) => openDialog({
    title,
    message,
    variant,
    confirmLabel,
    cancelLabel,
    showCancel: true,
  }), [openDialog]);

  const messageDialog = dialogState ? (
    <MessageDialog
      isOpen
      title={dialogState.title}
      message={dialogState.message}
      variant={dialogState.variant}
      confirmLabel={dialogState.confirmLabel}
      cancelLabel={dialogState.cancelLabel}
      showCancel={dialogState.showCancel}
      onConfirm={() => closeDialog(true)}
      onCancel={() => closeDialog(false)}
      onClose={() => closeDialog(false)}
    />
  ) : null;

  return {
    showMessage,
    showConfirm,
    messageDialog,
  };
}
