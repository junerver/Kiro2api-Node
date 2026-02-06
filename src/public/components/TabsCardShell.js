window.TabsCardShell = function TabsCardShell() {
    const [activeTab, setActiveTab] = React.useState('accounts');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <window.MainTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <window.AccountsTabShell active={activeTab === 'accounts'} />
            <window.LogsTabShell active={activeTab === 'logs'} />
            <window.AnalyticsTabShell active={activeTab === 'analytics'} />
            <window.SettingsTabShell active={activeTab === 'settings'} />
        </div>
    );
};
