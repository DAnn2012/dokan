import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { RadioGroup } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { DokanModal } from '@dokan/components';
import { VendorAsyncSelect } from '@src/components';

interface AddReverseWithdrawModalProps {
    open: boolean;
    onClose: () => void;
    onSave: ( data: any ) => void;
}

const AddReverseWithdrawModal: React.FC< AddReverseWithdrawModalProps > = ( {
    open,
    onClose,
    onSave,
} ) => {
    const [ transectionType, setTransectionType ] = useState<
        'manual_product' | 'manual_order' | 'other'
    >( 'manual_product' );
    const [ selectedProduct, setSelectedProduct ] = useState( '' );
    const [ selectedOrder, setSelectedOrder ] = useState( '' );
    const [ withdrawalType, setWithdrawalType ] = useState<
        'debit' | 'credit'
    >( 'debit' );
    const [ withdrawalAmount, setWithdrawalAmount ] = useState( '' );
    const [ withdrawalNote, setWithdrawalNote ] = useState( '' );
    const [ vendorsData, setVendorsData ] = useState(null);
    const [ loading, setLoading ] = useState(false);

    const handleConfirm = async () => {
        // Basic validation
        if (!vendorsData || !withdrawalAmount) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                vendorId: vendorsData,
                trnType: transectionType,
                productId: selectedProduct,
                orderId: selectedOrder,
                withdrawalType,
                withdrawalAmount,
                withdrawalNote,
            };
            
            await onSave( payload );
            
            // Reset form after successful save
            resetForm();
        } catch (error) {
            console.error('Error saving reverse withdrawal:', error);
            throw error; // Re-throw so DokanModal handles it
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTransectionType('manual_product');
        setSelectedProduct('');
        setSelectedOrder('');
        setWithdrawalType('debit');
        setWithdrawalAmount('');
        setWithdrawalNote('');
        setVendorsData(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Custom modal content
    const modalContent = (
        <div className="space-y-6 p-4">
            {/* Vendor - Only VendorAsyncSelect without icon */}
            <VendorAsyncSelect
                value={ vendorsData }
                onChange={ ( v: any ) => setVendorsData( v ) }
                isClearable
                label={ __( 'Select Vendor', 'dokan-lite' ) }
                placeholder={ __( 'Search vendor', 'dokan-lite' ) }
            />

            {/* Transaction Type */}
            <div>
                <h3 className="font-bold text-[1.1em] mb-2">
                    { __( 'Transaction Type', 'dokan-lite' ) }
                </h3>
                <RadioGroup
                    value={ transectionType }
                    onChange={ setTransectionType }
                    className="flex gap-4"
                >
                    { [
                        {
                            label: __( 'Product', 'dokan-lite' ),
                            value: 'manual_product',
                        },
                        {
                            label: __( 'Order', 'dokan-lite' ),
                            value: 'manual_order',
                        },
                        {
                            label: __( 'Other', 'dokan-lite' ),
                            value: 'other',
                        },
                    ].map( ( item ) => (
                        <RadioGroup.Option
                            key={ item.value }
                            value={ item.value }
                            className={ ( { checked } ) =>
                                twMerge(
                                    'px-4 py-2 border rounded-md cursor-pointer',
                                    checked
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'border-gray-300 text-gray-700'
                                )
                            }
                        >
                            { item.label }
                        </RadioGroup.Option>
                    ) ) }
                </RadioGroup>
            </div>

            {/* Select Product */}
            { transectionType === 'manual_product' && (
                <div>
                    <h3 className="font-bold text-[1.1em] mb-2">
                        { __( 'Select Product', 'dokan-lite' ) }
                    </h3>
                    <input
                        type="text"
                        placeholder={ __(
                            'Search product',
                            'dokan-lite'
                        ) }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={ selectedProduct }
                        onChange={ ( e ) =>
                            setSelectedProduct( e.target.value )
                        }
                    />
                </div>
            ) }

            {/* Select Order */}
            { transectionType === 'manual_order' && (
                <div>
                    <h3 className="font-bold text-[1.1em] mb-2">
                        { __( 'Select Order', 'dokan-lite' ) }
                    </h3>
                    <input
                        type="text"
                        placeholder={ __(
                            'Search order',
                            'dokan-lite'
                        ) }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={ selectedOrder }
                        onChange={ ( e ) =>
                            setSelectedOrder( e.target.value )
                        }
                    />
                </div>
            ) }

            {/* Withdrawal Balance Type */}
            <div>
                <h3 className="font-bold text-[1.1em] mb-2 flex items-center gap-2">
                    { __( 'Withdrawal Balance Type', 'dokan-lite' ) }
                    <span
                        title={ __(
                            'Adjust Balance by Creating a New Reverse Withdrawal Entry',
                            'dokan-lite'
                        ) }
                        className="text-gray-400 cursor-pointer"
                    >
                        ℹ
                    </span>
                </h3>
                <RadioGroup
                    value={ withdrawalType }
                    onChange={ setWithdrawalType }
                    className="flex gap-4"
                >
                    { [
                        {
                            label: __( 'Debit', 'dokan-lite' ),
                            value: 'debit',
                        },
                        {
                            label: __( 'Credit', 'dokan-lite' ),
                            value: 'credit',
                        },
                    ].map( ( item ) => (
                        <RadioGroup.Option
                            key={ item.value }
                            value={ item.value }
                            className={ ( { checked } ) =>
                                twMerge(
                                    'px-4 py-2 border rounded-md cursor-pointer',
                                    checked
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'border-gray-300 text-gray-700'
                                )
                            }
                        >
                            { item.label }
                        </RadioGroup.Option>
                    ) ) }
                </RadioGroup>
            </div>

            {/* Reverse Withdrawal Amount */}
            <div>
                <h3 className="font-bold text-[1.1em] mb-2">
                    { __( 'Reverse Withdrawal Amount', 'dokan-lite' ) }
                    <span className="text-red-500 ml-1">*</span>
                </h3>
                <input
                    type="number"
                    placeholder={ __( 'Enter amount', 'dokan-lite' ) }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={ withdrawalAmount }
                    onChange={ ( e ) =>
                        setWithdrawalAmount( e.target.value )
                    }
                    min="0"
                    step="0.01"
                />
            </div>

            {/* Notes */}
            <div>
                <h3 className="font-bold text-[1.1em] mb-2">
                    { __( 'Notes', 'dokan-lite' ) }
                </h3>
                <textarea
                    placeholder={ __(
                        'Write reverse withdrawal note',
                        'dokan-lite'
                    ) }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={ withdrawalNote }
                    onChange={ ( e ) =>
                        setWithdrawalNote( e.target.value )
                    }
                />
            </div>
        </div>
    );

    return (
        <DokanModal
            isOpen={open}
            onClose={handleClose}
            onConfirm={handleConfirm}
            namespace="add-reverse-withdrawal"
            className="max-w-[800px] w-full"
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