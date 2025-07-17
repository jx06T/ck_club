import { useState, useEffect, type FormEvent } from 'react';
import { MessageSquare, X, Send, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzXDNI4fJYjE6IgEtFUtAt6jXB3J3nwij7Pd_eqkmAtB7NVLPxdylpT-7pRBy5lmSI-/exec';

const FEEDBACK_TYPES = ["內文更正", "Bug 回報", "改善建議", "其他"];

type Status = 'idle' | 'loading' | 'success' | 'error';

const successContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
} as const;

const successItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12,
        },
    },
} as const;

function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const [type, setType] = useState(FEEDBACK_TYPES[0]);
    const [pageType, setPageType] = useState<'current' | 'other'>('current');
    const [otherPage, setOtherPage] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!feedbackText.trim() || !email.trim()) {
            setStatus('error');
            setErrorMessage('請填寫反饋內容和您的 Email。');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        const pageUrl = pageType === 'current' ? window.location.href : otherPage;

        const params = new URLSearchParams({
            type,
            pageUrl,
            feedbackText,
            email,
        });

        try {
            const response = await fetch(`${GAS_WEB_APP_URL}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`伺服器錯誤: ${response.statusText}`);
            }
            const result = await response.json();
            if (result.status === 'success') {
                setStatus('success');
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus('idle');
                    setFeedbackText('');
                    setEmail('');
                }, 5000);
            } else {
                throw new Error(result.message || '發生未知錯誤');
            }
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || '無法連接至伺服器，請稍後再試。');
        }
    };

    return (
        <>
            <div
                className={`fixed bottom-5 left-3 right-3 sm:right-[50%] z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'
                    }`}
            >
                <div className="w-full sm:w-96 bg-primary-100  rounded-lg shadow-2xl border border-primary-300 ">
                    <div className="p-4 border-b border-primary-300  flex justify-between items-center">
                        <h3 className="font-bold text-primary-900 ">提供您的寶貴意見</h3>
                        <button onClick={() => setIsOpen(false)} className="text-primary-600 hover:text-primary-900 ">
                            <X size={20} />
                        </button>
                    </div>
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                className="p-6 flex flex-col items-center justify-center text-center h-96"
                                variants={successContainerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <motion.div variants={successItemVariants}>
                                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                </motion.div>
                                <motion.h4 variants={successItemVariants} className="font-bold text-lg text-primary-900">
                                    提交成功！
                                </motion.h4>
                                <motion.p variants={successItemVariants} className="text-sm text-primary-700">
                                    感謝您的回饋，確認信已寄送至您的信箱。
                                </motion.p>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                className="p-4 space-y-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div>
                                    <label className="text-sm font-medium text-primary-800  block mb-1.5">問題類型</label>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {FEEDBACK_TYPES.map(t => (
                                            <label key={t} className="cursor-pointer">
                                                <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
                                                <span className={`px-3 py-1 text-sm rounded-full transition-colors ${type === t ? 'bg-accent-500 text-white font-semibold' : 'bg-primary-200  hover:bg-primary-300 '}`}>{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-primary-800  block mb-1.5">相關頁面</label>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <label className="cursor-pointer shrink-0 ">
                                            <input type="radio" name="pageType" value="當前頁面" checked={pageType === 'current'} onChange={() => setPageType('current')} className="sr-only" />
                                            <span className={`px-3 py-1 text-sm rounded-full transition-colors ${pageType === 'current' ? 'bg-accent-500 text-white font-semibold' : 'bg-primary-200  hover:bg-primary-300 '}`}>當前頁面</span>
                                        </label>
                                        <label className="cursor-pointer  shrink-0 ">
                                            <input type="radio" name="pageType" value="other" checked={pageType === 'other'} onChange={() => setPageType('other')} className="sr-only" />
                                            <span className={`px-3 py-1 text-sm rounded-full transition-colors ${pageType === 'other' ? 'bg-accent-500 text-white font-semibold' : 'bg-primary-200  hover:bg-primary-300 '}`}>其他</span>
                                        </label>
                                    </div>
                                </div>
                                {pageType === 'other' && (
                                    <input type="text" value={otherPage} onChange={(e) => setOtherPage(e.target.value)} placeholder="請輸入頁面網址或名稱" required className="w-full bg-primary-50 rounded-md px-3 py-2 text-base outline-hidden inline-block" />
                                )}
                                <div>
                                    <label htmlFor="feedbackText" className="text-sm font-medium text-primary-800  block mb-1.5">反饋內容</label>
                                    <textarea id="feedbackText" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={4} required className="w-full bg-primary-50 outline-hidden  rounded-md px-3 py-2 text-base focus:ring-accent-500 focus:border-accent-500 max-h-40" placeholder="請詳細描述您的問題或建議..."></textarea>
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-primary-800  block mb-1.5">您的 Email</label>
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-primary-50  outline-hidden rounded-md px-3 py-2 text-base focus:ring-accent-500 focus:border-accent-500" placeholder="方便我們寄送確認信" />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={status === 'loading'} className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-opacity disabled:opacity-70 disabled:cursor-not-allowed">
                                        {status === 'loading' ? <><Loader className="animate-spin mr-2" size={20} />提交中，這可能需要一點時間 </> : <><Send size={16} className="mr-2" /> 提交反饋</>}
                                    </button>
                                    {status === 'error' && (
                                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {errorMessage}</p>
                                    )}
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-14 bg-accent-300 px-10 p-4 rounded-md cursor-pointer transition-transform hover:scale-[1.02] focus-visible:ring-2 outline-hidden  ring-accent-500"
                aria-label="開啟反饋表單"
            >
                <MessageSquare size={24} className=" inline-block mr-0.5 mb-0.5" />
                <span> 按此回報問題或提供建議 </span>
            </button>
        </>
    );
};

export default FeedbackWidget;