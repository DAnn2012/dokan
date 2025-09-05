import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DokanModal, DokanButton } from '@dokan/components';
import { VendorAsyncSelect, ProductAsyncSelect, OrderAsyncSelect } from '@src/components';
import { Box, ShoppingBag, CreditCard, Info } from 'lucide-react';

const AddReverseWithdrawModal = ({ open, onClose }) => {
    const [transectionType, setTransectionType] = useState<
        'manual_product' | 'manual_order' | 'other'
    >('manual_product');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [withdrawalType, setWithdrawalType] = useState<'debit' | 'credit'>('debit');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalNote, setWithdrawalNote] = useState('');
    const [vendorsData, setVendorsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleConfirm = async () => {
        const newErrors = {};
        if (!vendorsData?.value) {
            newErrors.vendorId = true;
        }

        if (transectionType === 'manual_product' && !selectedProduct?.value) {
            newErrors.trId = true;
        }

        if (transectionType === 'manual_order' && !selectedOrder?.value) {
            newErrors.trId = true;
        }

        if (!withdrawalAmount) {
            newErrors.withdrawalAmount = true;
        }

        if (!withdrawalNote) {
            newErrors.withdrawalNote = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        let trn_id = 0;
        if (transectionType === 'manual_product') {
            trn_id = selectedProduct.value;
        } else if (transectionType === 'manual_order') {
            trn_id = selectedOrder.value;
        }

        const debit = withdrawalType === 'debit' ? String(withdrawalAmount) : '0';
        const credit = withdrawalType === 'credit' ? String(withdrawalAmount) : '0';

        const payload = {
            trn_id,
            trn_type: transectionType,
            vendor_id: vendorsData.value,
            note: withdrawalNote,
            debit,
            credit,
        };

        setLoading(true);
        try {
            const response = await apiFetch({
                path: 'dokan/v1/reverse-withdrawal/transactions',
                method: 'POST',
                data: payload,
            });

            resetForm();
            onClose();
            console.log('Reverse withdrawal created successfully:', response);
        } catch (error) {
            console.error('Error saving reverse withdrawal:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTransectionType('manual_product');
        setSelectedProduct(null);
        setSelectedOrder(null);
        setWithdrawalType('debit');
        setWithdrawalAmount('');
        setWithdrawalNote('');
        setVendorsData(null);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleVendorChange = (vendor: any) => {
        setVendorsData(vendor);
        setSelectedProduct(null);
        setSelectedOrder(null);
    };

    const handleTransactionTypeChange = (type: 'manual_product' | 'manual_order' | 'other') => {
        setTransectionType(type);
        setSelectedProduct(null);
        setSelectedOrder(null);
    };

    const handleWithdrawalTypeChange = (type: 'debit' | 'credit') => {
        setWithdrawalType(type);
    };

    const modalContent = (
        <div className="space-y-6 p-4 overflow-y-auto max-h-[700px]"> {/* Adjusted height for 818px total */}
            <div>
                <VendorAsyncSelect
                    value={vendorsData}
                    onChange={handleVendorChange}
                    isClearable
                    label={__('Select Vendor', 'dokan-lite')}
                    placeholder={__('Search', 'dokan-lite')}
                />
                {errors.vendorId && <span className="text-red-500 text-sm">{__('Please select a vendor', 'dokan-lite')}</span>}
            </div>

            <div>
                <h3 className="text-[1.1em] mb-2"> {/* Removed font-bold */}
                    {__('Transaction Type', 'dokan-lite')}
                </h3>
                <div className="flex gap-2">
                    {[
                        { label: __('Product', 'dokan-lite'), value: 'manual_product', icon: Box },
                        { label: __('Order', 'dokan-lite'), value: 'manual_order', icon: ShoppingBag },
                        { label: __('Other', 'dokan-lite'), value: 'other', icon: CreditCard },
                    ].map((item) => (
                        <DokanButton
                            key={item.value}
                            onClick={() => handleTransactionTypeChange(item.value as 'manual_product' | 'manual_order' | 'other')}
                            variant={transectionType === item.value ? 'primary' : 'secondary'}
                            className="px-4 py-2 flex items-center"
                        >
                            {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                            {item.label}
                        </DokanButton>
                    ))}
                </div>
            </div>

            {transectionType === 'manual_product' && (
                <div>
                    <h3 className="text-[1.1em] mb-2"> {/* Removed font-bold */}
                        {__('Select Product', 'dokan-lite')}
                    </h3>
                    <ProductAsyncSelect
                        value={selectedProduct}
                        onChange={setSelectedProduct}
                        placeholder={__('Search', 'dokan-lite')}
                        isClearable
                        defaultOptions={false}
                        isDisabled={!vendorsData}
                        extraQuery={{
                            ...(vendorsData?.value ? { id: vendorsData.value } : {}),
                            post_status: 'publish',
                        }}
                        noOptionsMessage={() =>
                            !vendorsData
                                ? __('Please select a vendor first', 'dokan-lite')
                                : __('No products found', 'dokan-lite')
                        }
                    />
                    {errors.trId && <span className="text-red-500 text-sm">{__('Please select a product', 'dokan-lite')}</span>}
                </div>
            )}

            {transectionType === 'manual_order' && (
                <div>
                    <h3 className="text-[1.1em] mb-2"> {/* Removed font-bold */}
                        {__('Select Order', 'dokan-lite')}
                    </h3>
                    <OrderAsyncSelect
                        value={selectedOrder}
                        onChange={setSelectedOrder}
                        placeholder={__('Search order', 'dokan-lite')}
                        isClearable
                        defaultOptions={false}
                        isDisabled={!vendorsData}
                        extraQuery={{
                            ...(vendorsData?.value && { seller_id: vendorsData.value }),
                            status: ['completed', 'processing', 'on-hold'],
                        }}
                        mapOption={(order) => ({
                            value: order.id,
                            label: `Order #${order.id}${order.total ? ` - $${order.total}` : ''}`,
                            raw: order,
                        })}
                        noOptionsMessage={() =>
                            !vendorsData
                                ? __('Please select a vendor first', 'dokan-lite')
                                : __('No orders found', 'dokan-lite')
                        }
                    />
                    {errors.trId && <span className="text-red-500 text-sm">{__('Please select an order', 'dokan-lite')}</span>}
                </div>
            )}

            <div>
                <h3 className="text-[1.1em] mb-2"> {/* Removed font-bold */}
                    {__('Withdrawal Balance Type', 'dokan-lite')}
                    <span
                        title={__(
                            'Adjust Balance by Creating a New Reverse Withdrawal Entry',
                            'dokan-lite'
                        )}
                        className="text-gray-400 cursor-pointer"
                    >
                        <Info className="w-4 h-4 inline-block ml-1" />
                    </span>
                </h3>
                <div className="flex gap-2">
                    {[
                        { label: __('Debit', 'dokan-lite'), value: 'debit' },
                        { label: __('Credit', 'dokan-lite'), value: 'credit' },
                    ].map((item) => (
                        <DokanButton
                            key={item.value}
                            onClick={() => handleWithdrawalTypeChange(item.value as 'debit' | 'credit')}
                            variant={withdrawalType === item.value ? 'primary' : 'secondary'}
                            className="px-4 py-2"
                        >
                            {item.label}
                        </DokanButton>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-[1.1em] mb-2"> {/* Removed font-bold */}
                    {__('Reverse Withdrawal Amount', 'dokan-lite')}
                    <span title={__('Enter the amount for the reverse withdrawal', 'dokan-lite')} className="text-gray-400 cursor-pointer">
                        <Info className="w-4 h-4 inline-block ml-1" />
                    </span>
                </h3>
                <input
                    type="number"
                    placeholder={__('Enter amount', 'dokan-lite')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    min="0"
                    step="0.01"
                />
                {errors.withdrawalAmount && <span className="text-red-500 text-sm">{__('Kindly provide the withdrawal amount', 'dokan-lite')}</span>}
            </div>

            <div>
                <h3 className="text-[1.1em] mb-2"> {/* Removed font-bold */}
                    {__('Notes', 'dokan-lite')}
                </h3>
                <textarea
                    placeholder={__('Write reverse withdrawal note', 'dokan-lite')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={withdrawalNote}
                    onChange={(e) => setWithdrawalNote(e.target.value)}
                />
                {errors.withdrawalNote && <span className="text-red-500 text-sm">{__('Please write reverse withdrawal note', 'dokan-lite')}</span>}
            </div>
        </div>
    );

    return (
        <DokanModal
            isOpen={open}
            onClose={handleClose}
            onConfirm={handleConfirm}
            namespace="add-reverse-withdrawal"
            className="max-w-[620px] w-full max-h-[818px] !important:max-w-[620px] !important:max-h-[818px]" // Forced resize with !important
            dialogTitle={__('Add New Reverse Withdrawal', 'dokan-lite')}
            dialogContent={modalContent}
            confirmButtonText={__('Add New', 'dokan-lite')}
            cancelButtonText={__('Cancel', 'dokan-lite')}
            confirmButtonVariant="primary"
            loading={loading}
        />
    );
};

export default AddReverseWithdrawModal;