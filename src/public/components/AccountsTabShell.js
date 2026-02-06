window.AccountsTabShell = function AccountsTabShell({ active }) {
    const [isMounted, setIsMounted] = React.useState(active);
    const [accounts, setAccounts] = React.useState([]);
    const [selectedAccounts, setSelectedAccounts] = React.useState(new Set());
    const [strategy, setStrategyValue] = React.useState('round-robin');

    const loadAccounts = React.useCallback(async () => {
        try {
            const list = await window.accountsService.fetchAccounts();
            setAccounts(list || []);
            setSelectedAccounts(new Set());
        } catch (e) {
            console.error(e);
        }
    }, []);

    const loadStrategy = React.useCallback(async () => {
        try {
            const data = await window.accountsService.getStrategy();
            setStrategyValue(data?.strategy || 'round-robin');
        } catch (e) {
            console.error(e);
        }
    }, []);

    const refreshAll = React.useCallback(async () => {
        await Promise.all([loadAccounts(), loadStrategy()]);
    }, [loadAccounts, loadStrategy]);

    React.useEffect(() => {
        if (active) {
            setIsMounted(true);
        }
    }, [active]);

    React.useEffect(() => {
        if (!isMounted) return;
        refreshAll();
    }, [isMounted, refreshAll]);

    React.useEffect(() => {
        if (!isMounted) return;
        const interval = setInterval(() => {
            if (window.adminKey) {
                loadAccounts();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [isMounted, loadAccounts]);

    React.useEffect(() => {
        if (!isMounted) return;
        window.__refreshAccountsTab = refreshAll;
        return () => {
            if (window.__refreshAccountsTab === refreshAll) {
                delete window.__refreshAccountsTab;
            }
        };
    }, [isMounted, refreshAll]);

    const onToggleSelect = React.useCallback((id, checked) => {
        setSelectedAccounts((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, []);

    const onSelectAll = React.useCallback((checked) => {
        setSelectedAccounts(() => {
            if (!checked) {
                return new Set();
            }
            return new Set((accounts || []).map((acc) => acc.id));
        });
    }, [accounts]);

    const onRefreshUsage = React.useCallback(async (id) => {
        try {
            await window.accountsService.refreshAccountUsage(id);
            window.showToast('刷新成功', 'success');
            loadAccounts();
        } catch (e) {
            window.showToast('刷新失败: ' + e.message, 'error');
        }
    }, [loadAccounts]);

    const onRefreshAllUsage = React.useCallback(async () => {
        try {
            window.showToast('正在刷新...', 'info');
            await window.accountsService.refreshAllAccountUsage();
            window.showToast('刷新完成！', 'success');
            loadAccounts();
        } catch (e) {
            window.showToast('刷新失败: ' + e.message, 'error');
        }
    }, [loadAccounts]);

    const onRemove = React.useCallback(async (id) => {
        if (!confirm('确定删除？')) return;
        try {
            await window.accountsService.deleteAccount(id);
            window.showToast('删除成功', 'success');
            refreshAll();
        } catch (e) {
            window.showToast('删除失败: ' + e.message, 'error');
        }
    }, [refreshAll]);

    const onEnable = React.useCallback(async (id) => {
        try {
            await window.accountsService.enableAccount(id);
            window.showToast('已启用', 'success');
            refreshAll();
        } catch (e) {
            window.showToast('启用失败: ' + e.message, 'error');
        }
    }, [refreshAll]);

    const onDisable = React.useCallback(async (id) => {
        try {
            await window.accountsService.disableAccount(id);
            window.showToast('已禁用', 'success');
            refreshAll();
        } catch (e) {
            window.showToast('禁用失败: ' + e.message, 'error');
        }
    }, [refreshAll]);

    const onBatchDelete = React.useCallback(async () => {
        if (selectedAccounts.size === 0) return;
        if (!confirm(`确定删除选中的 ${selectedAccounts.size} 个账号？`)) return;
        try {
            const ids = Array.from(selectedAccounts);
            const result = await window.accountsService.batchDeleteAccounts(ids);
            window.showToast(`成功删除 ${result?.removed || ids.length} 个账号`, 'success');
            refreshAll();
        } catch (e) {
            window.showToast('批量删除失败: ' + e.message, 'error');
        }
    }, [selectedAccounts, refreshAll]);

    const onStrategyChange = React.useCallback(async (value) => {
        try {
            await window.accountsService.setStrategy(value);
            setStrategyValue(value);
            window.showToast('策略已更新', 'success');
        } catch (e) {
            window.showToast('设置失败: ' + e.message, 'error');
        }
    }, []);

    return (
        <div id="tab-accounts" className={`p-6 tab-content ${active ? '' : 'hidden'}`}>
            <window.AccountsToolbar
                selectedCount={selectedAccounts.size}
                strategy={strategy}
                onAdd={() => showModal('addModal')}
                onImport={() => showModal('importModal')}
                onRefreshAll={onRefreshAllUsage}
                onBatchDelete={onBatchDelete}
                onStrategyChange={onStrategyChange}
                onRefresh={refreshAll}
            />
            <div className="overflow-x-auto">
                <window.AccountsTable
                    accounts={accounts}
                    selectedAccounts={selectedAccounts}
                    onToggleSelect={onToggleSelect}
                    onSelectAll={onSelectAll}
                    onRefreshUsage={onRefreshUsage}
                    onEnable={onEnable}
                    onDisable={onDisable}
                    onRemove={onRemove}
                />
            </div>
        </div>
    );
};
