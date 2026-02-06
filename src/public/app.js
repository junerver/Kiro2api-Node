// 首页入口脚本（仅负责初始化）
(function bootstrapApp() {
    function renderPageShell() {
        const rootEl = document.getElementById('app');
        if (!rootEl) return;

        const requiredDeps = ['React', 'ReactDOM', 'PageShell', 'LoginContainer', 'MainPanelShell', 'ToastContainer', 'ModalsRoot'];
        const missingDeps = requiredDeps.filter((dep) => !window[dep]);

        if (missingDeps.length > 0) {
            console.warn('等待依赖加载:', missingDeps);
            return;
        }

        if (window.__pageShellRoot) {
            return;
        }

        window.__pageShellRoot = ReactDOM.createRoot(rootEl);
        window.__pageShellRoot.render(<window.PageShell />);
    }

    function startRender() {
        window.adminKey = localStorage.getItem('kiro_admin_key') || '';
        setTimeout(renderPageShell, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startRender, { once: true });
    } else {
        startRender();
    }
})();
