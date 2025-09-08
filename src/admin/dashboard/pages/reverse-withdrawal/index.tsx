import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import { RawHTML, useEffect, useState, useCallback } from '@wordpress/element';
import { TextControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { formatPrice } from '@dokan/utilities';
import {
    DokanButton,
    DataViews,
    DateTimeHtml,
    Filter,
} from '@dokan/components';
import { Funnel } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
// Import the modal component
import AddReverseWithdrawModal from './AddReverseWithdrawModal';
import { House, Calendar } from 'lucide-react';
import { VendorAsyncSelect } from '@src/components';
// Import DateRangePicker
import DateRangePicker from '@src/components/DateRangePicker';
import moment from 'moment';

const price = (amount) => <RawHTML>{formatPrice(amount)}</RawHTML>;

const ReverseWithdrawalPage = () => {
    const [stats, setStats] = useState({
        credit: 0,
        balance: 0,
        total_transactions: 0,
        total_vendors: 0,
    });

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [filterArgs, setFilterArgs] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    // Add state for modal
    const [showAddModal, setShowAddModal] = useState(false);

    // Date range picker state
    const [dateAfter, setDateAfter] = useState('');
    const [dateAfterText, setDateAfterText] = useState('');
    const [dateBefore, setDateBefore] = useState('');
    const [dateBeforeText, setDateBeforeText] = useState('');
    const [focusedInput, setFocusedInput] = useState('startDate');

    const [view, setView] = useState({
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        layout: { density: 'comfortable' },
        fields: ['store_name', 'balance', 'last_payment_date'], // Explicitly define which fields to show
    });

    // Columns
    const fields = [
        {
            id: 'store_name',
            label: __('Store', 'dokan-lite'),
            enableGlobalSearch: true,
            render: ({ item }) => (
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                        {item.store_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">
                        {item.store_name || __('(no name)', 'dokan-lite')}
                    </span>
                </div>
            ),
        },
        {
            id: 'balance',
            label: __('Amount', 'dokan-lite'),
            enableSorting: true,
            render: ({ item }) => (
                <span className="font-semibold text-gray-900">{price(item.balance)}</span>
            ),
        },
        {
            id: 'last_payment_date',
            label: __('Date', 'dokan-lite'),
            enableSorting: true,
            render: ({ item }) => {
                if (!item.last_payment_date || isNaN(new Date(item.last_payment_date).getTime())) {
                    return '--';
                }

                const formattedDate = new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                }).format(new Date(item.last_payment_date));

                return <span>{formattedDate.replace(/\//g, '.')}</span>;
            },
        },
    ];

    // Fetch data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const queryArgs = {
                per_page: view.perPage,
                page: view.page,
                search: view.search || '',
                ...filterArgs,
            };

            // Add date range parameters in the format expected by the API
            if (dateAfter || dateBefore) {
                queryArgs['trn_date'] = {};
                
                if (dateAfter) {
                    // Format: YYYY-MM-DD HH:mm:ss (add time component)
                    
                    queryArgs['trn_date']['from'] = moment(dateAfter).format('YYYY-MM-DD 00:00:00');
                    console.log('Date from:', queryArgs['trn_date']['from']); // Debug log
                }
                
                if (dateBefore) {
                    // Format: YYYY-MM-DD HH:mm:ss (add time component for end of day)
                    queryArgs['trn_date']['to'] = moment(dateBefore).format('YYYY-MM-DD 23:59:59');
                    console.log('Date to:', queryArgs['trn_date']['to']); // Debug log
                }
            }

            console.log('API Query Args:', queryArgs); // Debug log

            const response = await apiFetch({
                path: addQueryArgs('dokan/v1/reverse-withdrawal/stores-balance', queryArgs),
                parse: false,
            });

            setStats({
                credit: parseFloat(response.headers.get('X-Status-Credit') || 0),
                balance: parseFloat(response.headers.get('X-Status-Balance') || 0),
                total_transactions: parseInt(response.headers.get('X-Status-Total-Transactions') || 0),
                total_vendors: parseInt(response.headers.get('X-Status-Total-Vendors') || 0),
            });

            const storeData = await response.json();
            console.log('Fetched data:', storeData); // Debug log
            setData(storeData);

            const total = parseInt(response.headers.get('X-WP-Total') || 0);
            setTotalItems(total);
        } catch (error) {
            console.error('Error fetching reverse withdrawal data:', error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [view, filterArgs, dateAfter, dateBefore]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Watch for date changes and trigger fetch (like Vue version)
    // useEffect(() => {
    //     if (dateAfter || dateBefore) {
    //         const timer = setTimeout(() => {
    //             fetchData();
    //         }, 300); // Small debounce like the Vue version
            
    //         return () => clearTimeout(timer);
    //     }
    // }, [dateAfter, dateBefore, fetchData]);

    // Handle modal save
    const handleModalSave = async (formData) => {
        try {
            // Make API call to save the reverse withdrawal
            await apiFetch({
                path: 'dokan/v1/reverse-withdrawal',
                method: 'POST',
                data: formData,
            });
            
            // Close modal and refresh data
            setShowAddModal(false);
            fetchData(); // Refresh the list after adding new entry
            
            // You might want to show a success message here
            console.log('Reverse withdrawal added successfully');
        } catch (error) {
            console.error('Error adding reverse withdrawal:', error);
            // You might want to show an error message here
        }
    };

    const StoreFilter = ({ filterArgs, setFilterArgs, errors = {} }) => {
        const handleVendorChange = (selected) => {
            setFilterArgs({
                ...filterArgs,
                vendor_id: selected ? selected.value : '', // store vendor_id instead of generic store
            });
        };

        return (
            <div className="flex flex-col min-w-48">
                <div className="relative">
                    <House className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />

                    <VendorAsyncSelect
                        prefetch
                        isClearable
                        onChange={handleVendorChange}
                        placeholder={__('All Store', 'dokan-lite')}
                        menuPortalTarget={document.body}
                        styles={{
                            control: (provided) => ({
                                ...provided,
                                paddingLeft: '1.5rem',
                            }),
                            menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                            }),
                        }}
                    />
                </div>

                {errors.vendorId && (
                    <span className="text-red-500 text-sm">
                        {__('Please select a vendor', 'dokan-lite')}
                    </span>
                )}
            </div>
        );
    };

    // Updated DateFilter component using DateRangePicker
    const DateFilter = () => {
        const handleDateRangeUpdate = (update) => {
            if (update.after !== undefined) {
                setDateAfter(update.after);
            }
            if (update.afterText !== undefined) {
                setDateAfterText(update.afterText);
            }
            if (update.before !== undefined) {
                setDateBefore(update.before);
            }
            if (update.beforeText !== undefined) {
                setDateBeforeText(update.beforeText);
            }
            if (update.focusedInput !== undefined) {
                setFocusedInput(update.focusedInput);
                
                if (update.focusedInput === 'endDate' && dateAfter) {
                    setDateBefore('');
                    setDateBeforeText('');
                }
            }
        };

        const handleClearDateRange = () => {
            setDateAfter('');
            setDateAfterText('');
            setDateBefore('');
            setDateBeforeText('');
            setFocusedInput('startDate');
        };

        return (
            <div className="flex flex-col min-w-48 relative">
                <DateRangePicker
                    after={dateAfter}
                    afterText={dateAfterText}
                    before={dateBefore}
                    beforeText={dateBeforeText}
                    onUpdate={handleDateRangeUpdate}
                    shortDateFormat="MM/DD/YYYY"
                    focusedInput={focusedInput}
                    isInvalidDate={() => false}
                    wrapperClassName="w-full"
                    pickerToggleClassName="block"
                    wpPopoverClassName="dokan-layout"
                    popoverBodyClassName="p-4 w-auto text-sm/6"
                    onClear={handleClearDateRange}
                    onOk={() => {
                        // Optional: Handle apply action if needed
                        fetchData();
                    }}
                >
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                        <input
                            type="text"
                            value={(() => {
                                const parts = [];
                                if (dateAfterText || dateAfter) {
                                    parts.push(dateAfterText || dateAfter);
                                }
                                if (dateBeforeText || dateBefore) {
                                    parts.push(dateBeforeText || dateBefore);
                                }
                                return parts.join(' - ');
                            })()}
                            className="border border-gray-300 rounded-md px-3 py-2 pl-9 text-gray-900 cursor-pointer w-full"
                            placeholder={__('Select date range', 'dokan-lite')}
                            readOnly
                        />
                    </div>
                </DateRangePicker>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray rounded-md shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {__('Reverse Withdrawal', 'dokan-lite')}
                </h1>
                <DokanButton 
                    variant="primary" 
                    onClick={() => setShowAddModal(true)}
                >
                    + {__('Add New', 'dokan-lite')}
                </DokanButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                        {__('Total Collected', 'dokan-lite')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{price(stats.credit)}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                        {__('Remaining Balance', 'dokan-lite')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{price(stats.balance)}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                        {__('Total Transactions', 'dokan-lite')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_transactions}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow border border-gray-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                        {__('Total Vendors', 'dokan-lite')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_vendors}</p>
                </div>
            </div>

            {/* Section Header with Filter button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                    {__('List of Data', 'dokan-lite')}
                </h2>
                <button
                    type="button"
                    className={twMerge(
                        'inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-[#7047EB] hover:text-white',
                        showFilters ? 'bg-[#7047EB] text-white' : 'text-[#575757] bg-white'
                    )}
                    onClick={() => setShowFilters((v) => !v)}
                >
                    <Funnel size={16} />
                    {__('Filter', 'dokan-lite')}
                </button>
            </div>

            {/* Filter panel */}
            <div className={showFilters ? 'mb-6' : 'hidden'}>
                <Filter
                    fields={[
                        <StoreFilter
                            key="store_filter"
                            filterArgs={filterArgs}
                            setFilterArgs={setFilterArgs}
                        />,
                        <DateFilter key="date_filter" />,
                    ]}
                    onFilter={fetchData}
                    showFilter={false}   // ⬅️ hide Filter button
                    showReset={false}    // ⬅️ hide Reset button
                    namespace="reverse_withdrawal_filters"
                />
            </div>

            {/* DataView with pagination footer */}
            <DataViews
                data={data}
                namespace="reverse-withdrawal-data-view"
                defaultLayouts={{ table: {}, list: {}, grid: {}, density: 'comfortable' }}
                fields={fields}
                getItemId={(item) => item.vendor_id}
                onChangeView={setView}
                paginationInfo={{
                    totalItems,
                    totalPages: Math.ceil(totalItems / view.perPage),
                }}
                view={view}
                isLoading={isLoading}
            />

            {/* Add Reverse Withdrawal Modal */}
            {showAddModal && (
                <AddReverseWithdrawModal
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
};

export default ReverseWithdrawalPage;