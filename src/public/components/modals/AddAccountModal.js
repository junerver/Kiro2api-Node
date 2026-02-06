window.AddAccountModal = function AddAccountModal() {
    const toggleIdcFields = React.useCallback(() => {
        const authEl = document.getElementById('acc-auth');
        const idcFields = document.getElementById('idc-fields');
        if (!authEl || !idcFields) {
            return;
        }
        idcFields.classList.toggle('hidden', authEl.value !== 'idc');
    }, []);

    const addAccount = React.useCallback(async () => {
        const data = {
            name: document.getElementById('acc-name')?.value || '未命名账号',
            auth_method: document.getElementById('acc-auth')?.value,
            refresh_token: document.getElementById('acc-refresh')?.value,
            client_id: document.getElementById('acc-client-id')?.value || null,
            client_secret: document.getElementById('acc-client-secret')?.value || null
        };

        if (!data.refresh_token) {
            window.showToast('请填写 Refresh Token', 'warning');
            return;
        }

        try {
            await fetchApi('/api/accounts', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            hideModal('addModal');
            window.showToast('添加成功', 'success');
            if (typeof window.__refreshAccountsTab === 'function') {
                window.__refreshAccountsTab();
            }
        } catch (e) {
            window.showToast('添加失败: ' + e.message, 'error');
        }
    }, []);

    return (
        <div id="addModal" className="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-scaleIn">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">添加账号</h3>
                    <button onClick={() => hideModal('addModal')} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" id="acc-name" placeholder="账号名称" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select id="acc-auth" onChange={toggleIdcFields} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="social">Social</option>
                        <option value="idc">IdC / BuilderId</option>
                    </select>
                    <textarea id="acc-refresh" placeholder="Refresh Token" rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    <div id="idc-fields" className="hidden space-y-4">
                        <input type="text" id="acc-client-id" placeholder="Client ID" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <textarea id="acc-client-secret" placeholder="Client Secret" rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                    <button onClick={() => hideModal('addModal')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">取消</button>
                    <button onClick={addAccount} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition">添加</button>
                </div>
            </div>
        </div>
    );
};