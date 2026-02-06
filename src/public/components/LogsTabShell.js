window.LogsTabShell = function LogsTabShell({ active }) {
    const [isMounted, setIsMounted] = React.useState(active);
    const [logs, setLogs] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(20);
    const [totalPages, setTotalPages] = React.useState(1);
    const [totalRecords, setTotalRecords] = React.useState(0);
    const [autoRefresh, setAutoRefresh] = React.useState(false);

    React.useEffect(() => {
        if (active) {
            setIsMounted(true);
        }
    }, [active]);

    const loadLogs = React.useCallback(async (page = currentPage, size = pageSize) => {
        try {
            const response = await window.logsService.fetchLogs({ page, pageSize: size });
            setLogs(response.data || []);
            const pagination = response.pagination || {};
            setCurrentPage(pagination.page || page);
            setTotalPages(pagination.totalPages || 1);
            setTotalRecords(pagination.total || 0);
        } catch (e) {
            window.showToast('加载失败: ' + e.message, 'error');
        }
    }, [currentPage, pageSize]);

    React.useEffect(() => {
        if (!isMounted) return;
        loadLogs();
    }, [isMounted, currentPage, pageSize, loadLogs]);

    React.useEffect(() => {
        if (!isMounted || !autoRefresh) return;
        const interval = setInterval(() => {
            loadLogs();
        }, 5000);
        return () => clearInterval(interval);
    }, [isMounted, autoRefresh, loadLogs]);

    React.useEffect(() => {
        if (!isMounted) return;
        window.__refreshLogsTab = () => loadLogs();
        return () => {
            if (window.__refreshLogsTab) {
                delete window.__refreshLogsTab;
            }
        };
    }, [isMounted, loadLogs]);

    const onToggleAutoRefresh = React.useCallback(() => {
        setAutoRefresh((prev) => {
            const next = !prev;
            window.showToast(next ? '已开启自动刷新' : '已关闭自动刷新', next ? 'success' : 'info');
            return next;
        });
    }, []);

    const onPageChange = React.useCallback((delta) => {
        setCurrentPage((prev) => {
            const next = prev + delta;
            if (next < 1 || next > totalPages) {
                return prev;
            }
            return next;
        });
    }, [totalPages]);

    const onPageSizeChange = React.useCallback((size) => {
        setPageSize(size);
        setCurrentPage(1);
    }, []);

    return (
        <div id="tab-logs" className={`p-6 tab-content ${active ? '' : 'hidden'}`}>
            <window.LogsToolbar
                onRefresh={() => loadLogs()}
                autoRefresh={autoRefresh}
                onToggleAutoRefresh={onToggleAutoRefresh}
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />
            <div className="overflow-x-auto">
                <window.LogsTable logs={logs} />
            </div>
        </div>
    );
};
