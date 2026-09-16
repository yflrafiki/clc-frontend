import { LuTriangleAlert, LuCheck } from 'react-icons/lu';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <LuTriangleAlert className="text-2xl text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Confirm Action</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            No, Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm font-semibold transition">
            <LuCheck /> Yes, Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
