window.StatsGrid = function StatsGrid() {
    const [stats, setStats] = React.useState({
        active: '-',
        cooldown: '-',
        invalid: '-',
        requests: '-',
        input: '-',
        output: '-',
        uptime: '-'
    });

    const loadStatsData = async () => {
        try {
            const data = await fetchApi('/api/status');
            const logStats = await fetchApi('/api/logs/stats');

            window.__serverStartTime = Date.now() - (data.uptimeSecs * 1000);

            setStats({
                active: data.pool.active,
                cooldown: data.pool.cooldown,
                invalid: data.pool.invalid,
                requests: formatNumber(data.pool.totalRequests),
                input: formatNumber(logStats.totalInputTokens || 0),
                output: formatNumber(logStats.totalOutputTokens || 0),
                uptime: formatUptime(data.uptimeSecs)
            });
        } catch (e) {
            console.error(e);
        }
    };

    React.useEffect(() => {
        loadStatsData();
        const interval = setInterval(loadStatsData, 5000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const uptimeTimer = setInterval(() => {
            if (window.__serverStartTime) {
                const uptime = Math.floor((Date.now() - window.__serverStartTime) / 1000);
                setStats((prev) => ({ ...prev, uptime: formatUptime(uptime) }));
            }
        }, 1000);
        return () => clearInterval(uptimeTimer);
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{stats.active || '-'}</div>
                <div className="text-sm text-gray-500">活跃账号</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-yellow-500">{stats.cooldown || '-'}</div>
                <div className="text-sm text-gray-500">冷却中</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-red-500">{stats.invalid || '-'}</div>
                <div className="text-sm text-gray-500">已失效</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{stats.requests || '-'}</div>
                <div className="text-sm text-gray-500">总请求</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-blue-500">{stats.input || '-'}</div>
                <div className="text-sm text-gray-500">输入Tokens</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-green-500">{stats.output || '-'}</div>
                <div className="text-sm text-gray-500">输出Tokens</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-purple-500">{stats.uptime || '-'}</div>
                <div className="text-sm text-gray-500">运行时间</div>
            </div>
        </div>
    );
};