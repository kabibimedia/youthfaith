export default function AdminPanel({ title, children, search, onSearch, searchPlaceholder, action }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {search !== undefined && (
                        <input
                            type="text"
                            placeholder={searchPlaceholder || 'Search...'}
                            value={search}
                            onChange={onSearch}
                            className="flex-1 sm:flex-none px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-w-[180px]"
                        />
                    )}
                    {action}
                </div>
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}
