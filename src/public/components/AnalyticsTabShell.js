window.AnalyticsTabShell = function AnalyticsTabShell({ active }) {
    const [isMounted, setIsMounted] = React.useState(active);

    React.useEffect(() => {
        if (active) {
            setIsMounted(true);
        }
    }, [active]);

    return (
        <div id="tab-analytics" className={`p-6 tab-content ${active ? '' : 'hidden'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">数据分析</h2>
            </div>
            {isMounted ? <window.AnalyticsDashboard /> : null}
        </div>
    );
};
