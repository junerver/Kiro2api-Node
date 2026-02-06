window.AccountsTable = function AccountsTable(props) {
    if (!props.accounts || props.accounts.length === 0) {
        return <div className="text-center py-12 text-gray-500">暂无账号，点击上方按钮添加</div>;
    }

    return (
        <table className="w-full">
            <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 rounded-tl-lg w-10">
                        <input
                            type="checkbox"
                            id="selectAll"
                            onChange={(event) => props.onSelectAll(event.target.checked)}
                            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                    </th>
                    <th className="px-4 py-3">名称</th>
                    <th className="px-4 py-3">状态</th>
                    <th className="px-4 py-3">额度</th>
                    <th className="px-4 py-3">请求</th>
                    <th className="px-4 py-3">错误</th>
                    <th className="px-4 py-3 rounded-tr-lg">操作</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {props.accounts.map((account, index) => (
                    <tr key={account.id} className={`hover:bg-gray-50 transition ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                        <td className="px-4 py-4">
                            <input
                                type="checkbox"
                                data-id={account.id}
                                checked={props.selectedAccounts.has(account.id)}
                                onChange={(event) => props.onToggleSelect(account.id, event.target.checked)}
                                className="account-checkbox rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                        </td>
                        <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{account.name}</div>
                            {account.usage?.userEmail && <div className="text-xs text-gray-500">{account.usage.userEmail}</div>}
                        </td>
                        <td className="px-4 py-4" dangerouslySetInnerHTML={{ __html: formatStatus(account.status) }}></td>
                        <td className="px-4 py-4" dangerouslySetInnerHTML={{ __html: formatUsage(account.usage) }}></td>
                        <td className="px-4 py-4 text-gray-600">{account.requestCount}</td>
                        <td className="px-4 py-4 text-gray-600">{account.errorCount}</td>
                        <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                                <button onClick={() => props.onRefreshUsage(account.id)} className="text-blue-500 hover:text-blue-700 text-sm" title="刷新额度">🔄</button>
                                {account.status === 'disabled' ? (
                                    <button onClick={() => props.onEnable(account.id)} className="text-green-500 hover:text-green-700 text-sm font-medium">启用</button>
                                ) : (
                                    <button onClick={() => props.onDisable(account.id)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">禁用</button>
                                )}
                                <button onClick={() => props.onRemove(account.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">删除</button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};