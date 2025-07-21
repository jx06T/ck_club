import { useState, useEffect, type MouseEvent } from 'react';
import { useLocalStorage } from '@/scripts/useLocalStorage';
import { ChevronRight, ChevronLeft, Send, Loader, PawPrint, AlertCircle, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const surveySteps = [
    { id: 'school', title: '您的學校（校友可選畢業學校）' },
    { id: 'grade', title: '您的年齡' },
    { id: 'gender', title: '您的性別' },
    { id: 'source', title: '如何得知本網站（複選）' },
    { id: 'fair', title: '社團博覽會' },
    { id: 'exhibition', title: '社團聯展' },
    { id: 'exhibitionSource', title: '如何得知社團聯展這個活動（複選）' },
];

const totalSteps = surveySteps.length - 1;

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
} as const;
const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: "easeIn" } }
} as const;
const successContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.1 } }
} as const;
const successItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
} as const;

// --- 主組件 (修改後) ---
export default function SurveyWidget() {
    const [hasCompletedSurvey, setHasCompletedSurvey] = useLocalStorage('hasCompletedSurvey', false);
    const [remindLaterCount, setRemindLaterCount] = useLocalStorage('surveyRemindLaterCount', 0);
    const [isSurveyVisible, setSurveyVisible] = useState(false);

    useEffect(() => {
        if (hasCompletedSurvey) return;

        setRemindLaterCount(prev => prev + 1);

        const REMIND_LATER_THRESHOLD = 4;
        const shouldShowNow = remindLaterCount > REMIND_LATER_THRESHOLD;

        const handleScroll = () => {
            if (window.scrollY > 2400) {
                setSurveyVisible(true);
                window.removeEventListener('scroll', handleScroll);
            }
        };

        if (remindLaterCount === 0) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        if (shouldShowNow) {
            const timer = setTimeout(() => {
                setSurveyVisible(true);
                setRemindLaterCount(0);
            }, 2000);

            return () => clearTimeout(timer);

        };
        window.addEventListener('scroll', handleScroll, { passive: true });

    }, []);


    if (typeof window === 'undefined' || !isSurveyVisible) {
        return null;
    }

    const handleComplete = () => {
        setHasCompletedSurvey(true);
        setSurveyVisible(false);
    };

    const handleDismiss = () => {
        setSurveyVisible(false);
        setRemindLaterCount(-2)
        // 考慮將關閉視為永久完成，避免使用者感到煩擾
        // setHasCompletedSurvey(true);
    };

    const handleRemindLater = () => {
        setSurveyVisible(false);
        setRemindLaterCount(1); // 開始計數
    };

    return <SurveyForm onComplete={handleComplete} onDismiss={handleDismiss} onRemindLater={handleRemindLater} />;
}


// --- 表單組件 (修改與修正後) ---
function SurveyForm({ onComplete, onDismiss, onRemindLater }: {
    onComplete: () => void;
    onDismiss: () => void;
    onRemindLater: () => void;
}) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        school: '', grade: '', gender: '',
        source: [] as string[], sourceOther: '',
        attendedFair: '', attendedExhibition: '',
        exhibitionSource: [] as string[], exhibitionSourceOther: ''
    });
    const [status, setStatus] = useState<'idle' | 'start' | 'loading' | 'success' | 'error'>('start');
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateStep = (stepIndex: number): boolean => {
        setValidationError(null);
        const stepId = surveySteps[stepIndex].id;
        switch (stepId) {
            case 'school': return !!formData.school;
            case 'grade': return !!formData.grade;
            case 'gender': return !!formData.gender;
            case 'source': return formData.source.length > 0 || !!formData.sourceOther.trim();
            case 'fair': return !!formData.attendedFair;
            case 'exhibition': return !!formData.attendedExhibition;
            case 'exhibitionSource': return formData.exhibitionSource.length > 0 || !!formData.exhibitionSourceOther.trim();
            default: return true;
        }
    };

    const handleNext = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            let nextStep = currentStep + 1;
            setCurrentStep(prev => Math.min(nextStep, totalSteps));
        } else {
            setValidationError('請完成此題再繼續');
        }
    };

    const handleBack = () => {
        setValidationError(null);
        let prevStep = currentStep - 1;
        // 跳題邏輯：如果返回的前一題是 exhibitionSource 且使用者不參加聯展，則再往前一格
        if (surveySteps[prevStep]?.id === 'exhibitionSource' && formData.attendedExhibition !== '有') {
            prevStep--;
        }
        setCurrentStep(prev => Math.max(prevStep, 0));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (validationError) setValidationError(null);

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: checked
                    ? [...(prev as any)[name], value]
                    : (prev as any)[name].filter((item: string) => item !== value),
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (type === 'radio') {
                setTimeout(() => {
                    let nextStep = currentStep + 1;
                    setCurrentStep(Math.min(nextStep, totalSteps));
                }, 50);
            }
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            setValidationError('請完成此題再繼續');
            return;
        }
        setStatus('loading');

        const submissionData = {
            school: formData.school,
            grade: formData.grade,
            gender: formData.gender,
            source: [...formData.source, formData.sourceOther].filter(Boolean).join(', '),
            attendedFair: formData.attendedFair,
            attendedExhibition: formData.attendedExhibition,
            exhibitionSource: [...formData.exhibitionSource, formData.exhibitionSourceOther].filter(Boolean).join(', ')
        };

        try {
            const response = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            if (!response.ok) throw new Error('提交失敗');
            setStatus('success');
            setTimeout(onComplete, 3000);
        } catch (error) {
            console.error("Survey submission failed:", error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (status === 'success') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                    className="bg-primary-100 rounded-xl p-12 text-center max-w-md mx-4"
                    variants={successContainerVariants} initial="hidden" animate="visible"
                >
                    <motion.div variants={successItemVariants}><PawPrint className="w-16 h-16 text-accent-500 inline-block mb-4" /></motion.div>
                    <motion.h2 variants={successItemVariants} className="text-2xl font-bold text-gray-800 mb-4">感謝您的填寫！</motion.h2>
                    <motion.p variants={successItemVariants} className="text-gray-600">您的寶貴意見是我們改進的動力。</motion.p>
                    {formData.attendedExhibition === '有' && formData.exhibitionSource.includes("還不清楚這個活動") && (
                        <motion.a href="/events/社團聯展" target='_blank' rel="noopener noreferrer" variants={successItemVariants} className=' text-primary-900 inline-block mt-1'>立刻了解社團聯展<ChevronRight className=' inline-block  mb-0.5 w-5' /></motion.a>
                    )}
                </motion.div>
            </div>
        );
    }

    if (status === 'start') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                    className="bg-primary-100 rounded-xl px-7 py-6 max-w-md mx-4 relative"
                    variants={successContainerVariants} initial="hidden" animate="visible"
                >
                    {/* <button onClick={onDismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"><X size={20} /></button> */}
                    <motion.h2 variants={successItemVariants} className="text-2xl font-bold text-primary-800 mb-4">邀請您填寫問卷</motion.h2>
                    <motion.p variants={successItemVariants} className="text-primary-700">為了讓我們更了解使用者，並持續優化網站體驗，我們誠摯邀請您花費約 30 秒 的時間填寫這份問卷。</motion.p>
                    <motion.p variants={successItemVariants} className="text-primary-700 mt-1">所有蒐集到的資料皆不會與您本人關聯，僅用於數據統計與分析，感謝。</motion.p>
                    <motion.div variants={successItemVariants} className='flex w-full gap-3 mt-4'>
                        <button onClick={onRemindLater} className="w-1/3 px-3 py-2 h-10 text-sm bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-md transition-colors flex items-center justify-center gap-1">
                            <Clock size={16} /> 稍後
                        </button>
                        <button onClick={() => setStatus('idle')} className="w-2/3 px-4 py-2 h-10 text-base bg-accent-500 text-white rounded-md transition-transform hover:-translate-y-0.5 hover:scale-[1.02]">
                            開始填寫 <ChevronRight className='inline-block mb-0.5' />
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-primary-100 rounded-md shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                variants={modalVariants} initial="hidden" animate="visible" exit="exit"
            >
                <div className="bg-primary-100 px-6 relative">
                    {/* <button onClick={onDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"><X size={22} /></button> */}
                    <div className="flex items-center justify-center mb-3 space-x-8 pt-5 ">
                        <div className="w-full bg-primary-50 rounded-full h-2 mt-1">
                            <motion.div
                                className="bg-accent-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            />
                        </div>
                        <div className="text-sm text-primary-600 shrink-0">
                            {Math.round((currentStep / totalSteps) * 100)}%
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-primary-900 pt-6 sm:pt-0">{surveySteps[currentStep]?.title}</h2>
                </div>

                <div className="p-6 h-[50vh] sm:h-[60vh] overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            variants={contentVariants} initial="hidden" animate="visible" exit="exit"
                        >

                            {currentStep === 0 && (
                                <div className="space-y-3">
                                    <div className=' grid grid-cols-2 gap-x-3 gap-y-3'>
                                        {['建國中學', '北一女中', '成功高中', '中山女高', '景美女中', '師大附中'].map(school => (
                                            <label key={school} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.school === school ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="school" value={school} checked={formData.school === school} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{school}</span></label>
                                        ))}
                                    </div>
                                    <label className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.school === "其他" ? " bg-primary-50 border-accent-500" : "  border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="school" value="其他" checked={formData.school === '其他'} onChange={handleInputChange} className=" hidden" /><span className="ml-3 text-primary-800 font-medium">其他</span></label>
                                </div>
                            )}
                            {currentStep === 1 && (
                                <div className="space-y-3">
                                    <div className=' grid grid-cols-1 gap-x-3 gap-y-3'>
                                        {['國中以下', '升高一', '升高二', '升高三', '大學', '30 歲以上'].map(grade => (
                                            <label key={grade} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.grade === grade ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="grade" value={grade} checked={formData.grade === grade} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{grade}</span></label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div className="space-y-3">
                                    {['男', '女', '不願透漏'].map(gender => (
                                        <label key={gender} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.gender === gender ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="gender" value={gender} checked={formData.gender === gender} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{gender}</span></label>
                                    ))}
                                </div>
                            )}
                            {currentStep === 3 && (
                                <div className="space-y-3">
                                    <div className=' grid grid-cols-2 gap-x-3 gap-y-3'>
                                        {['集章卡 QR code', '其他社群媒體帳號', '攤位 QR code', '班聯會哀居', '朋友分享'].map(source => (
                                            <label key={source} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.source.includes(source) ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="checkbox" name="source" value={source} checked={formData.source.includes(source)} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{source}</span></label>
                                        ))}
                                    </div>
                                    <input type="text" name="sourceOther" value={formData.sourceOther} onChange={handleInputChange} placeholder="其他方式..." className="w-full p-3 rounded-md outline-hidden border border-primary-50 focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-colors" />
                                </div>
                            )}
                            {currentStep === 4 && (
                                <div className="space-y-3">
                                    <p className="text-primary-700 mb-4">您是否有（或預計要）參加社團博覽會？</p>
                                    {['有', '沒有'].map(option => (
                                        <label key={option} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.attendedFair === option ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="attendedFair" value={option} checked={formData.attendedFair === option} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{option}</span></label>
                                    ))}
                                </div>
                            )}
                            {currentStep === 5 && (
                                <div className="space-y-3">
                                    <p className="text-primary-700 mb-4">您是否有（或預計要）參加社團聯展？</p>
                                    {['有', '沒有'].map(option => (
                                        <label key={option} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.attendedExhibition === option ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="attendedExhibition" value={option} checked={formData.attendedExhibition === option} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{option}</span></label>
                                    ))}
                                </div>
                            )}
                            {currentStep === 6 && (
                                <div className="space-y-4">
                                    <div className=' grid grid-cols-2 gap-x-3 gap-y-4'>
                                        {['還不清楚這個活動', '其他社群媒體帳號', '此網站', '班聯會哀居', '朋友分享'].map(source => (
                                            <label key={source} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.exhibitionSource.includes(source) ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="checkbox" name="exhibitionSource" value={source} checked={formData.exhibitionSource.includes(source)} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{source}</span></label>
                                        ))}
                                    </div>
                                    <input type="text" name="exhibitionSourceOther" value={formData.exhibitionSourceOther} onChange={handleInputChange} placeholder="其他方式..." className="w-full p-3 rounded-md outline-hidden border border-primary-50 focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-colors" />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    <AnimatePresence>
                        {validationError && (
                            <motion.p
                                className=" absolute bottom-2 text-sm text-red-600 flex items-center gap-1"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <AlertCircle size={14} className=' mt-0.5' /> {validationError}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <hr className=' mx-4 text-white' />
                <div className="px-6 pb-5 pt-4 flex items-center justify-between gap-4">
                    {currentStep === 0 ? <div className="w-1/5"></div> : (
                        <button type="button" onClick={handleBack} className="w-1/5 px-4 py-2 h-10 text-sm font-medium rounded-md bg-primary-50 transition-transform hover:-translate-y-0.5 hover:scale-[1.01] text-gray-600 hover:text-gray-800 hover:bg-gray-100">
                            <ChevronLeft className='inline-block' />
                        </button>
                    )}

                    {currentStep < totalSteps ? (
                        <button onClick={handleNext} className="w-4/5 px-4 py-2 h-10 text-base bg-accent-500 text-white rounded-md transition-transform hover:-translate-y-0.5 hover:scale-[1.02]">
                            下一題 <ChevronRight className='inline-block mb-0.5' />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={status === 'loading'} className={`w-4/5 px-4 py-2 h-10 text-base rounded-md transition-transform hover:-translate-y-0.5 hover:scale-[1.02] ${status === 'loading' ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-accent-500 text-white'}`}>
                            {status === 'loading' ? '提交中...' : '完成並提交'}
                            {status === 'loading' ? <Loader className="animate-spin inline-block mb-0.5 ml-1 w-5" /> : <Send className='inline-block mb-0.5 ml-1 w-5' />}
                        </button>
                    )}
                </div>
            </motion.div>
        </div >
    );
}