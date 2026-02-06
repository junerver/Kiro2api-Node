window.SettingsTabShell = function SettingsTabShell({ active }) {
    const [isMounted, setIsMounted] = React.useState(active);
    const [activeSubTab, setActiveSubTab] = React.useState('general');
    const [apiKeys, setApiKeys] = React.useState([]);
    const [models, setModels] = React.useState([]);
    const [mappings, setMappings] = React.useState([]);

    React.useEffect(() => {
        return () => {
            window.__currentEditingKey = null;
        };
    }, []);

    const subTabs = [
        { id: 'general', label: '常规设置' },
        { id: 'models', label: '模型管理' },
        { id: 'mappings', label: '模型映射' }
    ];

    const maskKey = React.useCallback((key) => {
        if (!key || key.length <= 10) return key;
        return key.substring(0, 7) + '****' + key.substring(key.length - 4);
    }, []);

    const copyText = React.useCallback((text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => window.showToast('已复制到剪贴板', 'success'))
            .catch(() => prompt('复制失败，请手动复制:', text));
    }, []);

    const loadApiKeys = React.useCallback(async () => {
        try {
            const keys = await fetchApi('/api/settings/api-keys');
            setApiKeys(keys || []);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const loadModels = React.useCallback(async () => {
        try {
            const list = await fetchApi('/api/models');
            setModels(list || []);
        } catch (e) {
            window.showToast('加载模型失败: ' + e.message, 'error');
        }
    }, []);

    const loadMappings = React.useCallback(async () => {
        try {
            const list = await fetchApi('/api/model-mappings');
            setMappings(list || []);
        } catch (e) {
            window.showToast('加载映射失败: ' + e.message, 'error');
        }
    }, []);

    React.useEffect(() => {
        if (active) {
            setIsMounted(true);
        }
    }, [active]);

    React.useEffect(() => {
        if (!isMounted) return;
        if (activeSubTab === 'general') {
            loadApiKeys();
        } else if (activeSubTab === 'models') {
            loadModels();
        } else if (activeSubTab === 'mappings') {
            loadMappings();
        }
    }, [isMounted, activeSubTab, loadApiKeys, loadModels, loadMappings]);

    React.useEffect(() => {
        if (!isMounted) return;
        window.__refreshSettingsGeneral = loadApiKeys;
        return () => {
            if (window.__refreshSettingsGeneral === loadApiKeys) {
                delete window.__refreshSettingsGeneral;
            }
        };
    }, [isMounted, loadApiKeys]);

    const changeAdminKey = React.useCallback(async () => {
        const newKey = document.getElementById('new-admin-key')?.value.trim() || '';
        if (!newKey) {
            window.showToast('请输入新的管理密钥', 'warning');
            return;
        }
        if (newKey.length < 6) {
            window.showToast('密钥长度至少 6 位', 'warning');
            return;
        }
        if (!confirm('确定修改管理密钥？修改后需要重新登录。')) return;
        try {
            await fetchApi('/api/settings/admin-key', {
                method: 'POST',
                body: JSON.stringify({ new_key: newKey })
            });
            window.showToast('修改成功！请重新登录', 'success');
            if (typeof window.logout === 'function') {
                window.logout();
            }
        } catch (e) {
            window.showToast('修改失败: ' + e.message, 'error');
        }
    }, []);

    const createApiKey = React.useCallback(async () => {
        const name = document.getElementById('api-key-name')?.value.trim() || '';
        const createBtn = document.getElementById('create-key-btn');
        const cancelBtn = document.getElementById('cancel-key-btn');
        const confirmBtn = document.getElementById('confirm-key-btn');

        if (!createBtn || !cancelBtn || !confirmBtn) return;

        createBtn.disabled = true;
        createBtn.textContent = '创建中...';

        try {
            const res = await fetchApi('/api/settings/api-keys', {
                method: 'POST',
                body: JSON.stringify({ name: name || null })
            });

            if (res.success) {
                document.getElementById('generated-key-value').value = res.key;
                document.getElementById('generated-key-display').classList.remove('hidden');
                document.getElementById('api-key-name').disabled = true;
                createBtn.classList.add('hidden');
                cancelBtn.classList.add('hidden');
                confirmBtn.classList.remove('hidden');
                window.showToast('密钥创建成功', 'success');
                loadApiKeys();
            }
        } catch (e) {
            window.showToast('创建失败: ' + e.message, 'error');
            createBtn.disabled = false;
            createBtn.textContent = '创建';
        }
    }, [loadApiKeys]);

    const copyGeneratedKey = React.useCallback(() => {
        const input = document.getElementById('generated-key-value');
        if (!input) return;
        input.select();
        document.execCommand('copy');
        window.showToast('密钥已复制', 'success');
    }, []);

    const editKeyName = React.useCallback((key) => {
        window.__currentEditingKey = key;
        const input = document.getElementById('rename-key-name');
        if (input) {
            input.value = '';
        }
        showModal('renameApiKeyModal');
        setTimeout(() => {
            const field = document.getElementById('rename-key-name');
            if (field) {
                field.focus();
            }
        }, 100);
    }, []);

    const confirmRenameApiKey = React.useCallback(async () => {
        const currentEditingKey = window.__currentEditingKey;
        if (!currentEditingKey) return;

        const newName = document.getElementById('rename-key-name')?.value.trim() || '';

        try {
            const res = await fetchApi(`/api/settings/api-keys/${encodeURIComponent(currentEditingKey)}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: newName || null })
            });

            if (res.success) {
                window.showToast('名称已更新', 'success');
                hideModal('renameApiKeyModal');
                window.__currentEditingKey = null;
                loadApiKeys();
            }
        } catch (e) {
            window.showToast('更新失败: ' + e.message, 'error');
        }
    }, [loadApiKeys]);

    const removeApiKey = React.useCallback(async (key) => {
        if (!confirm('确定删除此 API 密钥？')) return;
        try {
            await fetchApi('/api/settings/api-keys', {
                method: 'DELETE',
                body: JSON.stringify({ key })
            });
            window.showToast('删除成功', 'success');
            loadApiKeys();
        } catch (e) {
            window.showToast('删除失败: ' + e.message, 'error');
        }
    }, [loadApiKeys]);

    const confirmAddModel = React.useCallback(async () => {
        const id = document.getElementById('model-id')?.value.trim() || '';
        const displayName = document.getElementById('model-display-name')?.value.trim() || '';
        const maxTokens = parseInt(document.getElementById('model-max-tokens')?.value, 10) || 32000;
        const displayOrder = parseInt(document.getElementById('model-display-order')?.value, 10) || 0;

        if (!id || !displayName) {
            window.showToast('请填写必填项', 'warning');
            return;
        }

        try {
            await fetchApi('/api/models', {
                method: 'POST',
                body: JSON.stringify({ id, displayName, maxTokens, displayOrder })
            });
            hideModal('addModelModal');
            window.showToast('添加成功', 'success');
            loadModels();
            document.getElementById('model-id').value = '';
            document.getElementById('model-display-name').value = '';
            document.getElementById('model-max-tokens').value = '';
            document.getElementById('model-display-order').value = '';
        } catch (e) {
            window.showToast('添加失败: ' + e.message, 'error');
        }
    }, [loadModels]);

    const editModel = React.useCallback((id) => {
        const model = (models || []).find((item) => item.id === id);
        if (!model) return;
        document.getElementById('edit-model-id').value = model.id;
        document.getElementById('edit-model-display-name').value = model.displayName;
        document.getElementById('edit-model-max-tokens').value = model.maxTokens;
        document.getElementById('edit-model-display-order').value = model.displayOrder;
        showModal('editModelModal');
    }, [models]);

    const confirmEditModel = React.useCallback(async () => {
        const id = document.getElementById('edit-model-id')?.value;
        const displayName = document.getElementById('edit-model-display-name')?.value.trim() || '';
        const maxTokens = parseInt(document.getElementById('edit-model-max-tokens')?.value, 10);
        const displayOrder = parseInt(document.getElementById('edit-model-display-order')?.value, 10);

        try {
            await fetchApi(`/api/models/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ displayName, maxTokens, displayOrder })
            });
            hideModal('editModelModal');
            window.showToast('更新成功', 'success');
            loadModels();
        } catch (e) {
            window.showToast('更新失败: ' + e.message, 'error');
        }
    }, [loadModels]);

    const deleteModel = React.useCallback(async (id) => {
        if (!confirm('确定要删除此模型吗？')) return;
        try {
            await fetchApi(`/api/models/${id}`, { method: 'DELETE' });
            window.showToast('删除成功', 'success');
            loadModels();
        } catch (e) {
            window.showToast('删除失败: ' + e.message, 'error');
        }
    }, [loadModels]);

    const toggleModel = React.useCallback(async (id) => {
        try {
            await fetchApi(`/api/models/${id}/toggle`, { method: 'PATCH' });
            window.showToast('状态已更新', 'success');
            loadModels();
        } catch (e) {
            window.showToast('操作失败: ' + e.message, 'error');
        }
    }, [loadModels]);

    const resetModels = React.useCallback(async () => {
        if (!confirm('确定要重置为默认模型列表吗？这将删除所有自定义模型。')) return;
        try {
            await fetchApi('/api/models/reset', { method: 'POST' });
            window.showToast('已重置为默认模型', 'success');
            loadModels();
        } catch (e) {
            window.showToast('重置失败: ' + e.message, 'error');
        }
    }, [loadModels]);

    const confirmAddMapping = React.useCallback(async () => {
        const externalPattern = document.getElementById('mapping-pattern')?.value.trim() || '';
        const matchType = document.getElementById('mapping-match-type')?.value || 'contains';
        const internalId = document.getElementById('mapping-internal-id')?.value.trim() || '';
        const priority = parseInt(document.getElementById('mapping-priority')?.value, 10) || 0;

        if (!externalPattern || !internalId) {
            window.showToast('请填写必填项', 'warning');
            return;
        }

        if (matchType === 'regex') {
            try {
                new RegExp(externalPattern, 'i');
            } catch (e) {
                window.showToast('无效的正则表达式: ' + e.message, 'error');
                return;
            }
        }

        try {
            await fetchApi('/api/model-mappings', {
                method: 'POST',
                body: JSON.stringify({ externalPattern, matchType, internalId, priority })
            });
            hideModal('addMappingModal');
            window.showToast('添加成功', 'success');
            loadMappings();
            document.getElementById('mapping-pattern').value = '';
            document.getElementById('mapping-match-type').value = 'contains';
            document.getElementById('mapping-internal-id').value = '';
            document.getElementById('mapping-priority').value = '';
        } catch (e) {
            window.showToast('添加失败: ' + e.message, 'error');
        }
    }, [loadMappings]);

    const editMapping = React.useCallback((id) => {
        const mapping = (mappings || []).find((item) => item.id === id);
        if (!mapping) return;
        document.getElementById('edit-mapping-id').value = mapping.id;
        document.getElementById('edit-mapping-pattern').value = mapping.externalPattern;
        document.getElementById('edit-mapping-match-type').value = mapping.matchType;
        document.getElementById('edit-mapping-internal-id').value = mapping.internalId;
        document.getElementById('edit-mapping-priority').value = mapping.priority;
        showModal('editMappingModal');
    }, [mappings]);

    const confirmEditMapping = React.useCallback(async () => {
        const id = document.getElementById('edit-mapping-id')?.value;
        const externalPattern = document.getElementById('edit-mapping-pattern')?.value.trim() || '';
        const matchType = document.getElementById('edit-mapping-match-type')?.value || 'contains';
        const internalId = document.getElementById('edit-mapping-internal-id')?.value.trim() || '';
        const priority = parseInt(document.getElementById('edit-mapping-priority')?.value, 10);

        if (matchType === 'regex') {
            try {
                new RegExp(externalPattern, 'i');
            } catch (e) {
                window.showToast('无效的正则表达式: ' + e.message, 'error');
                return;
            }
        }

        try {
            await fetchApi(`/api/model-mappings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ externalPattern, matchType, internalId, priority })
            });
            hideModal('editMappingModal');
            window.showToast('更新成功', 'success');
            loadMappings();
        } catch (e) {
            window.showToast('更新失败: ' + e.message, 'error');
        }
    }, [loadMappings]);

    const deleteMapping = React.useCallback(async (id) => {
        if (!confirm('确定要删除此映射规则吗？')) return;
        try {
            await fetchApi(`/api/model-mappings/${id}`, { method: 'DELETE' });
            window.showToast('删除成功', 'success');
            loadMappings();
        } catch (e) {
            window.showToast('删除失败: ' + e.message, 'error');
        }
    }, [loadMappings]);

    const toggleMapping = React.useCallback(async (id) => {
        try {
            await fetchApi(`/api/model-mappings/${id}/toggle`, { method: 'PATCH' });
            window.showToast('状态已更新', 'success');
            loadMappings();
        } catch (e) {
            window.showToast('操作失败: ' + e.message, 'error');
        }
    }, [loadMappings]);

    const resetMappings = React.useCallback(async () => {
        if (!confirm('确定要重置为默认映射规则吗？这将删除所有自定义映射。')) return;
        try {
            await fetchApi('/api/model-mappings/reset', { method: 'POST' });
            window.showToast('已重置为默认映射', 'success');
            loadMappings();
        } catch (e) {
            window.showToast('重置失败: ' + e.message, 'error');
        }
    }, [loadMappings]);

    React.useEffect(() => {
        window.createApiKey = createApiKey;
        window.copyGeneratedKey = copyGeneratedKey;
        window.confirmRenameApiKey = confirmRenameApiKey;
        window.confirmAddModel = confirmAddModel;
        window.confirmEditModel = confirmEditModel;
        window.confirmAddMapping = confirmAddMapping;
        window.confirmEditMapping = confirmEditMapping;

        window.editKeyName = editKeyName;
        window.removeApiKey = removeApiKey;
        window.editModel = editModel;
        window.deleteModel = deleteModel;
        window.toggleModel = toggleModel;
        window.editMapping = editMapping;
        window.deleteMapping = deleteMapping;
        window.toggleMapping = toggleMapping;

        window.changeAdminKey = changeAdminKey;
        window.resetModels = resetModels;
        window.resetMappings = resetMappings;
        window.copyText = copyText;

        return () => {
            delete window.createApiKey;
            delete window.copyGeneratedKey;
            delete window.confirmRenameApiKey;
            delete window.confirmAddModel;
            delete window.confirmEditModel;
            delete window.confirmAddMapping;
            delete window.confirmEditMapping;
            delete window.editKeyName;
            delete window.removeApiKey;
            delete window.editModel;
            delete window.deleteModel;
            delete window.toggleModel;
            delete window.editMapping;
            delete window.deleteMapping;
            delete window.toggleMapping;
            delete window.changeAdminKey;
            delete window.resetModels;
            delete window.resetMappings;
            delete window.copyText;
        };
    }, [
        createApiKey,
        copyGeneratedKey,
        confirmRenameApiKey,
        confirmAddModel,
        confirmEditModel,
        confirmAddMapping,
        confirmEditMapping,
        editKeyName,
        removeApiKey,
        editModel,
        deleteModel,
        toggleModel,
        editMapping,
        deleteMapping,
        toggleMapping,
        changeAdminKey,
        resetModels,
        resetMappings,
        copyText
    ]);

    if (!isMounted) {
        return (
            <div id="tab-settings" className={`p-6 tab-content ${active ? '' : 'hidden'}`}></div>
        );
    }

    return (
        <div id="tab-settings" className={`p-6 tab-content ${active ? '' : 'hidden'}`}>
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`settings-tab-btn py-2 px-1 border-b-2 font-medium text-sm ${
                                activeSubTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className={`settings-content ${activeSubTab !== 'general' ? 'hidden' : ''}`}>
                <div className="max-w-2xl">
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">API 端点</h3>
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2 font-medium">Anthropic 格式</p>
                            <div className="space-y-2 font-mono text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">GET</span>
                                    <span className="text-gray-700">/v1/models</span>
                                    <button onClick={() => copyText(location.origin + '/v1/models')} className="text-blue-500 hover:text-blue-700 text-xs">复制</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">POST</span>
                                    <span className="text-gray-700">/v1/messages</span>
                                    <button onClick={() => copyText(location.origin + '/v1/messages')} className="text-blue-500 hover:text-blue-700 text-xs">复制</button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Base URL: <span className="text-gray-700">{location.origin}</span></p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">管理密钥</h3>
                        <p className="text-sm text-gray-500 mb-4">用于登录管理面板</p>
                        <div className="flex gap-3">
                            <input type="password" id="new-admin-key" placeholder="输入新的管理密钥" className="flex-1 max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button onClick={changeAdminKey} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">修改密钥</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">API 密钥</h3>
                        <p className="text-sm text-gray-500 mb-4">用于 API 调用认证，支持多个</p>
                        <div className="flex gap-3 mb-4">
                            <button onClick={() => showModal('createApiKeyModal')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">创建密钥</button>
                            <button onClick={loadApiKeys} className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 transition">刷新</button>
                        </div>

                        {apiKeys.length === 0 ? (
                            <div className="text-gray-500 text-sm">暂无 API 密钥</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="px-4 py-3 rounded-tl-lg">名称</th>
                                        <th className="px-4 py-3">密钥</th>
                                        <th className="px-4 py-3">创建时间</th>
                                        <th className="px-4 py-3 rounded-tr-lg text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {apiKeys.map((item) => (
                                        <tr key={item.key} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-gray-900">{item.name || '(未命名)'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm text-gray-600">{maskKey(item.key)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => editKeyName(item.key)} className="text-blue-500 hover:text-blue-700 text-sm font-medium mr-2">编辑</button>
                                                <button onClick={() => copyText(item.key)} className="text-green-500 hover:text-green-700 text-sm font-medium mr-2">复制</button>
                                                <button onClick={() => removeApiKey(item.key)} className="text-red-500 hover:text-red-700 text-sm font-medium">删除</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <div className={`settings-content ${activeSubTab !== 'models' ? 'hidden' : ''}`}>
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">模型列表</h3>
                    <div className="flex gap-2">
                        <button onClick={() => showModal('addModelModal')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">添加模型</button>
                        <button onClick={resetModels} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">重置默认</button>
                        <button onClick={loadModels} className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 transition">刷新</button>
                    </div>
                </div>

                {models.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">暂无模型</div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型 ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">显示名称</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Tokens</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {models.map((m) => (
                                    <tr key={m.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">{m.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{m.displayName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{m.maxTokens}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded ${m.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {m.enabled ? '启用' : '禁用'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm space-x-2">
                                            <button onClick={() => editModel(m.id)} className="text-blue-600 hover:text-blue-800">编辑</button>
                                            <button onClick={() => toggleModel(m.id)} className="text-yellow-600 hover:text-yellow-800">{m.enabled ? '禁用' : '启用'}</button>
                                            <button onClick={() => deleteModel(m.id)} className="text-red-600 hover:text-red-800">删除</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className={`settings-content ${activeSubTab !== 'mappings' ? 'hidden' : ''}`}>
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">映射规则</h3>
                    <div className="flex gap-2">
                        <button onClick={() => showModal('addMappingModal')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">添加映射</button>
                        <button onClick={resetMappings} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">重置默认</button>
                        <button onClick={loadMappings} className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 transition">刷新</button>
                    </div>
                </div>

                {mappings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">暂无映射规则</div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">匹配模式</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">匹配类型</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">内部模型 ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">优先级</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mappings.map((m) => (
                                    <tr key={m.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">{m.externalPattern}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className={`px-2 py-1 text-xs rounded ${m.matchType === 'regex' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {m.matchType === 'regex' ? '正则' : '包含'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{m.internalId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{m.priority}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded ${m.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {m.enabled ? '启用' : '禁用'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm space-x-2">
                                            <button onClick={() => editMapping(m.id)} className="text-blue-600 hover:text-blue-800">编辑</button>
                                            <button onClick={() => toggleMapping(m.id)} className="text-yellow-600 hover:text-yellow-800">{m.enabled ? '禁用' : '启用'}</button>
                                            <button onClick={() => deleteMapping(m.id)} className="text-red-600 hover:text-red-800">删除</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
