// API 调用函数

async function fetchApi(url, options = {}) {
    const currentAdminKey = window.adminKey || '';
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentAdminKey,
            ...options.headers
        }
    });
    if (res.status === 401) {
        if (typeof window.logout === 'function') {
            window.logout();
        }
        throw new Error('认证失败');
    }
    if (!res.ok && res.status !== 204) throw new Error(await res.text() || res.statusText);
    return res.status === 204 ? null : res.json();
}
