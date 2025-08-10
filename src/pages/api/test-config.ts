import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
    try {
        const configInfo = {
            timestamp: new Date().toISOString(),
            
            // 檢查環境類型
            environment: {
                CF_PAGES: (globalThis as any).CF_PAGES || locals?.runtime?.env?.CF_PAGES || 'not set',
                NODE_ENV: (globalThis as any).NODE_ENV || locals?.runtime?.env?.NODE_ENV || 'not set',
                runtime: typeof globalThis?.navigator !== 'undefined' ? 'browser-like' : 'node-like'
            },
            
            // 檢查 WASM 綁定
            wasm_bindings: {
                // Astro + Cloudflare 通常會把 WASM 放在 locals.runtime.env
                RESVG_WASM_in_runtime: typeof locals?.runtime?.env?.RESVG_WASM,
                RESVG_WASM_exists_runtime: !!locals?.runtime?.env?.RESVG_WASM,
                
                // 也檢查其他可能位置
                RESVG_WASM_global: typeof (globalThis as any).RESVG_WASM,
                RESVG_WASM_exists_global: !!(globalThis as any).RESVG_WASM,
                
                all_runtime_env_keys: locals?.runtime?.env ? Object.keys(locals.runtime.env) : 'no runtime env'
            },
            
            // 檢查 locals 結構
            locals_info: {
                locals_exists: !!locals,
                locals_keys: locals ? Object.keys(locals) : 'no locals',
                runtime_exists: !!locals?.runtime,
                runtime_keys: locals?.runtime ? Object.keys(locals.runtime) : 'no runtime',
                env_exists: !!locals?.runtime?.env,
                env_keys: locals?.runtime?.env ? Object.keys(locals.runtime.env) : 'no env'
            },
            
            // 檢查是否為 Cloudflare 環境
            cloudflare_specific: {
                has_cf_object: !!(request as any).cf,
                cf_colo: (request as any).cf?.colo || 'no colo',
                cf_country: (request as any).cf?.country || 'no country',
                // Cloudflare 專用的 runtime 檢查
                has_runtime_waitUntil: typeof locals?.runtime?.waitUntil === 'function',
                has_runtime_passThroughOnException: typeof locals?.runtime?.passThroughOnException === 'function'
            },
            
            // 檢查其他可能的 WASM 位置
            global_search: {
                globalThis_wasm_keys: Object.keys(globalThis).filter(key =>
                    key.toLowerCase().includes('wasm') ||
                    key.toLowerCase().includes('resvg')
                ),
                // 檢查是否有 WebAssembly 全域物件
                WebAssembly_available: typeof WebAssembly !== 'undefined',
                WebAssembly_instantiate: typeof WebAssembly?.instantiate === 'function'
            }
        };
        
        return new Response(JSON.stringify(configInfo, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error: any) {
        return new Response(JSON.stringify({
            error: 'Configuration test failed',
            message: error.message,
            stack: error.stack
        }, null, 2), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};