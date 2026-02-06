window.LoginContainer = function LoginContainer({ isLoggedIn, onAuthenticated }) {
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const checkAuth = async () => {
            const adminKey = localStorage.getItem('kiro_admin_key') || '';
            if (adminKey) {
                try {
                    const res = await fetch('/api/status', {
                        headers: { 'Authorization': 'Bearer ' + adminKey }
                    });
                    if (res.ok) {
                        window.adminKey = adminKey;
                        if (typeof onAuthenticated === 'function') {
                            onAuthenticated({ showToast: false });
                        }
                        setIsLoading(false);
                        return;
                    }
                    localStorage.removeItem('kiro_admin_key');
                } catch (e) {
                    console.error('Auth check failed:', e);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [onAuthenticated]);

    const handleLoginSuccess = () => {
        if (typeof onAuthenticated === 'function') {
            onAuthenticated({ showToast: true });
        }
    };

    if (isLoading) {
        return (
            <div id="loginPage" className="min-h-screen flex items-center justify-center animate-fadeIn">
                <div className="text-gray-500">加载中...</div>
            </div>
        );
    }

    if (isLoggedIn) {
        return <div id="loginPage" className="hidden"></div>;
    }

    return (
        <div id="loginPage" className="min-h-screen flex items-center justify-center animate-fadeIn">
            <window.LoginPage onLoginSuccess={handleLoginSuccess} />
        </div>
    );
};