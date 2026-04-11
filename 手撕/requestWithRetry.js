/*
问题拆解：
1.重试时机
    - 所有网络错误都要重试吗？404、403这种错误有必要重试吗？
2.重试策略
    - 错误发生时，要立即重试，还是等一会？等多久？
*/

// 根据错误类型判断是否应该重试
function shouldRetry(error) {
    // 网络错误，需要重试
    if (!error.response) return true;

    // 5xx 服务器错误，需要重试
    if (error.response.status >= 500) return true;

    // 429 限流，需要重试
    if (error.response.status === 429) return true;

    // 其他情况不需要重试
    return false;
}

// 计算重试延迟
function getRetryDelay(attempt, baseDelay = 1000) {
    // 递增延迟
    const exponentialDelay = Math.pow(2, attempt) * baseDelay;

    // 加入随即抖动（例如 ±30%），避免大量客户端同步重试导致服务器遭受新的流量峰值
    const jitter = exponentialDelay * 0.6 * (Math.random() - 0.5);

    // 返回最终延迟
    return exponentialDelay + jitter;
}

async function request(
    url,
    options = {},
    config = { maxRetries: 3, baseDelay: 1000 },
) {
    const { maxRetries, baseDelay } = config;

    // 当重试次数没达到上限时不断重试
    for (let i = 0; i <= maxRetries; i++) {
        try {
            // 发起请求
            const response = await fetch(url, options);

            // 如果请求失败，丢出错误，等待捕获和重试处理
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            // 如果请求成功，返回结果，结束循环
            return response;
        } catch (error) {
            const isLastAttempt = i === maxRetries;

            // 如果达到重试次数上线，或者产生的错误无需重试，则直接抛出错误
            if (isLastAttempt || !shouldRetry(error)) {
                throw error;
            }

            // 如果需要重试，就先计算当前轮的重试延迟
            const delay = getRetryDelay(i, baseDelay);

            // 模拟延迟等待效果
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}

// 测试用例：前两次失败，第三次成功
let attempt = 0;
const originalFetch = globalThis.fetch;

globalThis.fetch = async () => {
    attempt++;
    console.log(`第 ${attempt} 次请求`);

    if (attempt < 3) {
        console.log("失败，原因：网络异常，正在自动重试...");
        throw new Error("网络异常");
    }

    return {
        ok: true,
        status: 200,
        async json() {
            return {
                code: 200,
                message: "success",
                attempt,
            };
        },
    };
};

request("https://mock.api/retry", {}, { maxRetries: 3, baseDelay: 1000 })
    .then(async (response) => {
        const data = await response.json();
        console.log("测试通过，请求最终成功:", data);
    })
    .catch((error) => {
        console.log("测试失败:", error.message);
    })
    .finally(() => {
        globalThis.fetch = originalFetch;
    });
