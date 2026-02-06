window.PageShell = function PageShell() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    const handleAuthenticated = React.useCallback((options = {}) => {
        const { showToast = true } = options;
        window.adminKey = localStorage.getItem('kiro_admin_key') || window.adminKey || '';
        setIsLoggedIn(true);
        if (showToast && typeof window.showToast === 'function') {
            window.showToast('登录成功', 'success');
        }
    }, []);

    const handleLogout = React.useCallback((options = {}) => {
        const { showToast = false } = options;
        window.adminKey = '';
        localStorage.removeItem('kiro_admin_key');
        delete window.__refreshAccountsTab;
        delete window.__refreshLogsTab;
        delete window.__refreshSettingsGeneral;
        setIsLoggedIn(false);
        if (showToast && typeof window.showToast === 'function') {
            window.showToast('已退出登录', 'info');
        }
    }, []);

    const handleTopNavLogout = React.useCallback(() => {
        handleLogout({ showToast: false });
        window.location.reload();
    }, [handleLogout]);

    React.useEffect(() => {
        window.logout = handleLogout;
        return () => {
            if (window.logout === handleLogout) {
                delete window.logout;
            }
        };
    }, [handleLogout]);

    return (
        <>
            <window.LoginContainer
                isLoggedIn={isLoggedIn}
                onAuthenticated={handleAuthenticated}
            />
            <window.MainPanelShell
                isLoggedIn={isLoggedIn}
                onLogout={handleTopNavLogout}
            />
            <window.ToastContainer />
            <window.ModalsRoot />
        </>
    );
};
