const imageModules =
    import.meta.glob("../images/**/*.{png,jpg,jpeg,webp,gif,svg}", {
        eager: true,
        query: '?url',
        import: 'default'
    });

const baseName = path => {
    const name = path.split("/").pop() || "";
    return name.replace(/\.[^.]+$/, "");
};

const normalizeKey = key => {
    return String(key || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
};

const rawImageMap = {};
const normalizedImageMap = {};

Object.entries(imageModules).forEach(([path, url]) => {
    const originalKey = baseName(path);
    const normalizedKey = normalizeKey(originalKey);

    rawImageMap[originalKey] = url;
    normalizedImageMap[normalizedKey] = url;
});

export const imageMap = new Proxy(rawImageMap, {
    get(target, key) {
        if (typeof key !== 'string') {
            return target[key];
        }
        if (key in target) {
            return target[key];
        }
        const normKey = normalizeKey(key);
        if (normKey in normalizedImageMap) {
            return normalizedImageMap[normKey];
        }
        return target[key];
    }
});

const preloadedUrls = new Set();

export function preloadImageUrl(url) {
    if (typeof window === 'undefined' || !url || preloadedUrls.has(url)) return;
    preloadedUrls.add(url);
    const img = new Image();
    img.src = url;
}

export function preloadProductImages(imageKeys) {
    if (!imageKeys || !Array.isArray(imageKeys)) return;
    imageKeys.forEach(key => {
        const url = resolveProductImage(key);
        if (url) {
            preloadImageUrl(url);
        }
    });
}

export function resolveProductImage(imageKey) {
    if (!imageKey) return undefined;
    const normKey = normalizeKey(imageKey);
    return normalizedImageMap[normKey] || rawImageMap[imageKey] || undefined;
}

if (typeof window !== 'undefined') {
    const triggerPreload = () => {
        const keys = Object.keys(rawImageMap).slice(0, 8);
        keys.forEach(key => {
            const url = rawImageMap[key];
            if (url) {
                preloadImageUrl(url);
            }
        });
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(triggerPreload);
    } else {
        setTimeout(triggerPreload, 1000);
    }
}