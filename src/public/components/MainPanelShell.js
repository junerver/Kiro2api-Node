window.MainPanelShell = function MainPanelShell({ isLoggedIn, onLogout }) {
    if (!isLoggedIn) {
        return <div id="mainPanel" className="hidden"></div>;
    }

    return (
        <div id="mainPanel">
            <window.TopNavBar onLogout={onLogout} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
                <window.StatsGrid />
                <window.TabsCardShell />
            </div>
        </div>
    );
};
