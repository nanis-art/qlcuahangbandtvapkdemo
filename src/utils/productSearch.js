export function normalizeSearchText(s) {
    return String(s || '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase()
        .trim();
}

function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j += 1) dp[j] = j;
    for (let i = 1; i <= m; i += 1) {
        let prev = i - 1;
        dp[0] = i;
        for (let j = 1; j <= n; j += 1) {
            const tmp = dp[j];
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[j] = Math.min(
                dp[j] + 1,
                dp[j - 1] + 1,
                prev + cost
            );
            prev = tmp;
        }
    }
    return dp[n];
}

function isSubsequence(small, large) {
    if (!small.length) return true;
    let i = 0;
    for (let j = 0; j < large.length && i < small.length; j += 1) {
        if (large[j] === small[i]) i += 1;
    }
    return i === small.length;
}

function tokenize(s) {
    if (!s) return [];
    const clean = s.replace(/[-_.,]/g, ' ');
    return clean.match(/[a-z]+|[0-9]+/g) || [];
}

export function scoreNameMatch(normQuery, normName) {
    if (!normQuery || !normName) return 0;
    if (normName === normQuery) {
        return 380 + Math.min(normQuery.length, 20);
    }
    const compactN = normName.replace(/\s+/g, '');
    const compactQ = normQuery.replace(/\s+/g, '');
    if (compactN === compactQ) {
        return 360 + Math.min(normQuery.length, 20);
    }
    if (normName.startsWith(normQuery)) {
        return 340 + Math.min(normQuery.length, 20);
    }
    if (compactN.startsWith(compactQ)) {
        return 320 + Math.min(normQuery.length, 20);
    }
    if (normName.includes(normQuery)) {
        return 300 + Math.min(normQuery.length, 20);
    }
    if (compactN.includes(compactQ)) {
        return 280 + Math.min(normQuery.length, 20);
    }
    const qTokens = tokenize(normQuery);
    const nameTokens = tokenize(normName);

    if (qTokens.length > 0 && nameTokens.length > 0) {
        let totalQueryWeight = 0;
        let totalWeightedScore = 0;
        for (const qt of qTokens) {
            let weight = 2.0;
            if (qt.length === 1) weight = 0.5;
            else if (qt.length === 2) weight = 1.0;
            totalQueryWeight += weight;
            let bestTokenScore = 0;
            for (const nt of nameTokens) {
                if (qt === nt) {
                    bestTokenScore = 1.0;
                    break;
                }
                if (nt.includes(qt) || qt.includes(nt)) {
                    const overlap = Math.min(qt.length, nt.length) / Math.max(qt.length, nt.length);
                    const subScore = 0.7 + 0.2 * overlap;
                    if (subScore > bestTokenScore) bestTokenScore = subScore;
                }
                if (qt.length >= 3 && nt.length >= 3) {
                    const dist = levenshtein(qt, nt);
                    const maxLen = Math.max(qt.length, nt.length);
                    const threshold = Math.max(1, Math.floor(maxLen / 3));
                    if (dist <= threshold) {
                        const fuzzyScore = 0.6 * (1 - dist / maxLen);
                        if (fuzzyScore > bestTokenScore) bestTokenScore = fuzzyScore;
                    }
                }
            }
            totalWeightedScore += bestTokenScore * weight;
        }
        const averageScore = totalQueryWeight > 0 ? (totalWeightedScore / totalQueryWeight) : 0;
        if (averageScore > 0) {
            if (averageScore >= 0.99) {
                return 260 + Math.min(qTokens.length * 5, 20);
            }
            if (averageScore >= 0.8) {
                return 220 + averageScore * 30;
            }
            if (averageScore >= 0.5) {
                return 160 + averageScore * 40;
            }
            if (averageScore >= 0.25) {
                return 100 + averageScore * 60;
            }
            return averageScore * 100;
        }
    }
    if (compactQ.length >= 3 && isSubsequence(compactQ, compactN)) {
        return 100 + (compactQ.length / compactN.length) * 50;
    }
    return 0;
}
export function rankProductsBySearch(products, rawQuery, limit = 12) {
    const q = normalizeSearchText(rawQuery);
    if (!q) return [];
    const scored = products
        .map((p) => ({
            product: p,
            score: scoreNameMatch(q, normalizeSearchText(p.name))
        }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((x) => x.product);
}
export function filterProductsBySearch(products, rawQuery) {
    return rankProductsBySearch(products, rawQuery, 9999);
}