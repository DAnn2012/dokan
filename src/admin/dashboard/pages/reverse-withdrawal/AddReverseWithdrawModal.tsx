import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { RadioGroup } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface AddReverseWithdrawModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const AddReverseWithdrawModal: React.FC<AddReverseWithdrawModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [transectionType, setTransectionType] = useState<'manual_product' | 'manual_order' | 'other'>('manual_product');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [withdrawalType, setWithdrawalType] = useState<'debit' | 'credit'>('debit');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');

  const handleSave = () => {
    const payload = {
      vendorId: selectedVendor,
      trnType: transectionType,
      productId: selectedProduct,
      orderId: selectedOrder,
      withdrawalType,
      withdrawalAmount,
      withdrawalNote,
    };
    onSave(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-[800px] w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {__('Add New Reverse Withdrawal', 'dokan-lite')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Vendor */}
          <div>
            <h3 className="font-bold text-[1.1em] mb-2">{__('Select Vendor', 'dokan-lite')}</h3>
            <input
              type="text"
              placeholder={__('Search vendor', 'dokan-lite')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            />
          </div>

          {/* Transaction Type */}
          <div>
            <h3 className="font-bold text-[1.1em] mb-2">{__('Transaction Type', 'dokan-lite')}</h3>
            <RadioGroup value={transectionType} onChange={setTransectionType} className="flex gap-4">
              {[
                { label: __('Product', 'dokan-lite'), value: 'manual_product' },
                { label: __('Order', 'dokan-lite'), value: 'manual_order' },
                { label: __('Other', 'dokan-lite'), value: 'other' },
              ].map((item) => (
                <RadioGroup.Option
                  key={item.value}
                  value={item.value}
                  className={({ checked }) =>
                    twMerge(
                      'px-4 py-2 border rounded-md cursor-pointer',
                      checked ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-700'
                    )
                  }
                >
                  {item.label}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </div>

          {/* Select Product */}
          {transectionType === 'manual_product' && (
            <div>
              <h3 className="font-bold text-[1.1em] mb-2">{__('Select Product', 'dokan-lite')}</h3>
              <input
                type="text"
                placeholder={__('Search product', 'dokan-lite')}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              />
            </div>
          )}

          {/* Select Order */}
          {transectionType === 'manual_order' && (
            <div>
              <h3 className="font-bold text-[1.1em] mb-2">{__('Select Order', 'dokan-lite')}</h3>
              <input
                type="text"
                placeholder={__('Search order', 'dokan-lite')}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
              />
            </div>
          )}

          {/* Withdrawal Balance Type */}
          <div>
            <h3 className="font-bold text-[1.1em] mb-2 flex items-center gap-2">
              {__('Withdrawal Balance Type', 'dokan-lite')}
              <span title={__('Adjust Balance by Creating a New Reverse Withdrawal Entry', 'dokan-lite')} className="text-gray-400 cursor-pointer">ℹ</span>
            </h3>
            <RadioGroup value={withdrawalType} onChange={setWithdrawalType} className="flex gap-4">
              {[
                { label: __('Debit', 'dokan-lite'), value: 'debit' },
                { label: __('Credit', 'dokan-lite'), value: 'credit' },
              ].map((item) => (
                <RadioGroup.Option
                  key={item.value}
                  value={item.value}
                  className={({ checked }) =>
                    twMerge(
                      'px-4 py-2 border rounded-md cursor-pointer',
                      checked ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-700'
                    )
                  }
                >
                  {item.label}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </div>

          {/* Reverse Withdrawal Amount */}
          <div>
            <h3 className="font-bold text-[1.1em] mb-2">{__('Reverse Withdrawal Amount', 'dokan-lite')}</h3>
            <input
              type="number"
              placeholder={__('Enter amount', 'dokan-lite')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-bold text-[1.1em] mb-2">{__('Notes', 'dokan-lite')}</h3>
            <textarea
              placeholder={__('Write reverse withdrawal note', 'dokan-lite')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px]"
              value={withdrawalNote}
              onChange={(e) => setWithdrawalNote(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {__('Cancel', 'dokan-lite')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {__('Add New', 'dokan-lite')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReverseWithdrawModal;