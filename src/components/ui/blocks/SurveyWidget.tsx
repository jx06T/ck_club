import { useState, useEffect, type MouseEvent } from 'react';
import { useLocalStorage } from '@/scripts/useLocalStorage';
import { ChevronRight, ChevronLeft, Send, Loader, PawPrint, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

// --- 組件配置 ---
const surveySteps = [
    { id: 'school', title: '您的學校（校友可填畢業學校）' },
    { id: 'grade', title: '您的年齡' },
    { id: 'gender', title: '您的性別' },
    { id: 'source', title: '如何得知本網站（複選）' },
    { id: 'fair', title: '社團博覽會' },
    { id: 'exhibition', title: '社團聯展' },
    { id: 'exhibitionSource', title: '如何得知社團聯展這個活動（複選）' },
];
const totalSteps = surveySteps.length - 1; // 實際問題步驟數

// --- 動畫變體定義 ---
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

// --- 主組件 ---
export default function SurveyWidget() {
    const [hasCompletedSurvey, setHasCompletedSurvey] = useLocalStorage('hasCompletedSurvey', false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    if (!isReady || hasCompletedSurvey) {
        return null;
    }

    return <SurveyForm onComplete={() => setHasCompletedSurvey(true)} />;
}

// --- 表單組件 ---
function SurveyForm({ onComplete }: { onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        school: '', schoolOther: '', grade: '', gender: '', genderOther: '',
        source: [] as string[], sourceOther: '', attendedFair: '', attendedExhibition: '', exhibitionSource: [] as string[], exhibitionSourceOther: ''
    });
    const [status, setStatus] = useState<'idle' | 'start' | 'loading' | 'success' | 'error'>('start');
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateStep = (stepIndex: number): boolean => {
        setValidationError(null);
        const stepId = surveySteps[stepIndex].id;
        switch (stepId) {
            case 'school':
                if (!formData.school) return false;
                if (formData.school === '其他' && !formData.schoolOther.trim()) return false;
                return true;
            case 'grade':
                return !!formData.grade;
            case 'gender':
                if (!formData.gender) return false;
                if (formData.gender === '其他' && !formData.genderOther.trim()) return false;
                return true;
            case 'source':
                return formData.source.length > 0 || !!formData.sourceOther.trim();
            case 'fair':
                return !!formData.attendedFair;
            case 'exhibition':
                return !!formData.attendedExhibition;
            case 'exhibition_source':
                return formData.exhibitionSource.length > 0 || !!formData.exhibitionSourceOther.trim();
            default:
                return true;
        }
    };

    const handleNext = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, surveySteps.length - 1));
        } else {
            setValidationError('請完成此題再繼續');
        }
    };

    const handleBack = () => {
        setValidationError(null);
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (validationError) setValidationError(null);

        if (['source', 'exhibitionSource'].includes(name)) {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: checked
                    ? [...(prev as any)[name], value]
                    : (prev as any)[name].filter((item: string) => item !== value),
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            setValidationError('請完成此題再繼續');
            return;
        }
        setStatus('loading');

        const submissionData = {
            school: formData.school === '其他' ? formData.schoolOther : formData.school,
            grade: formData.grade,
            gender: formData.gender === '其他' ? formData.genderOther : formData.gender,
            source: [...formData.source, formData.sourceOther].filter(Boolean).join(', '),
            exhibitionSource: [...formData.exhibitionSource, formData.exhibitionSourceOther].filter(Boolean).join(', '),
            attendedFair: formData.attendedFair,
            attendedExhibition: formData.attendedExhibition,
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
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (status === 'success') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <motion.div
                    className="bg-primary-100 rounded-xl p-12 text-center max-w-md mx-4"
                    variants={successContainerVariants}
                    initial="hidden" animate="visible"
                >
                    <motion.div variants={successItemVariants}><PawPrint className="w-16 h-16 text-accent-500 inline-block mb-4" /></motion.div>
                    <motion.h2 variants={successItemVariants} className="text-2xl font-bold text-gray-800 mb-4">感謝您的填寫！</motion.h2>
                    <motion.p variants={successItemVariants} className="text-gray-600">您的寶貴意見是我們改進的動力。</motion.p>
                    {formData.exhibitionSource.includes("還不清楚這個活動") && <motion.a href="/events/社團聯展" target='_blenk' variants={successItemVariants} className=' text-primary-900 inline-block mt-1'>立刻了解社團聯展<ChevronRight className=' inline-block  mb-0.5 w-5' /></motion.a>}
                </motion.div>
            </div>
        );
    }

    if (status === 'start') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <motion.div
                    className="bg-primary-100 rounded-xl px-7 py-6 max-w-md mx-4"
                    variants={successContainerVariants}
                    initial="hidden" animate="visible"
                >
                    <motion.h2 variants={successItemVariants} className="text-2xl font-bold text-gray-800 mb-4">邀請您填寫問卷</motion.h2>
                    <motion.p variants={successItemVariants} className="text-gray-600">為了讓我們更了解使用者，並持續優化網站體驗，我們誠摯邀請您花費約 30 秒 的時間填寫這份問卷。</motion.p>
                    <motion.p variants={successItemVariants} className="text-gray-600 mt-1">所有蒐集到的資料皆不會與您本人關聯，僅用於數據統計與分析，感謝。</motion.p>
                    <motion.button variants={successItemVariants} onClick={() => setStatus('idle')} className="w-full px-4 py-2 h-10 mt-4 text-base bg-accent-500 text-white rounded-md transition-transform hover:-translate-y-0.5 hover:scale-[1.02]">
                        開始填寫
                        <ChevronRight className='inline-block mb-0.5' />
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-primary-100 rounded-md shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                variants={modalVariants}
                initial="hidden" animate="visible" exit="exit"
            >
                <div className="bg-primary-100 px-6 ">
                    <div className="flex items-center justify-center mb-3 space-x-8 pt-6 ">
                        <div className="w-full bg-primary-50 rounded-full h-2 mt-1">
                            <motion.div
                                className="bg-accent-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            ></motion.div>
                        </div>
                        <div className="text-sm text-primary-600 shrink-0">
                            {Math.round((currentStep / totalSteps) * 100)}%
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-primary-900 pt-6 sm:pt-0">{surveySteps[currentStep].title}</h2>
                </div>

                <div className="p-6 h-[50vh] sm:h-[60vh] overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            variants={contentVariants}
                            initial="hidden" animate="visible" exit="exit"
                        >

                            {currentStep === 0 && (
                                <div className="space-y-3">
                                    <div className=' grid grid-cols-2 gap-x-3 gap-y-4'>
                                        {['建國中學', '北一女中', '成功高中', '中山女高', '景美女中', '師大附中'].map(school => (
                                            <label key={school} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.school === school ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="school" value={school} checked={formData.school === school} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{school}</span></label>
                                        ))}
                                    </div>
                                    <label className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.school === "其他" ? " bg-primary-50 border-accent-500" : "  border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="school" value="其他" checked={formData.school === '其他'} onChange={handleInputChange} className=" hidden" /><span className="ml-3 text-primary-800 font-medium">其他</span></label>
                                    {formData.school === '其他' && (<input type="text" name="schoolOther" value={formData.schoolOther} onChange={handleInputChange} placeholder="請輸入您的學校" className="w-full p-3 rounded-md outline-hidden border border-accent-500 focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-colors" />)}
                                </div>
                            )}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className=' grid grid-cols-2 gap-x-3 gap-y-4'>
                                        {['國中/國小', '升高一', '升高二', '升高三', '升大一', '大一以上', '30 歲以上'].map(grade => (
                                            <label key={grade} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.grade === grade ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="grade" value={grade} checked={formData.grade === grade} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{grade}</span></label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    {['男', '女', '其他'].map(gender => (
                                        <label key={gender} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.gender === gender ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="gender" value={gender} checked={formData.gender === gender} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-primary-800 font-medium">{gender}</span></label>
                                    ))}
                                    {formData.gender === '其他' && (<input type="text" name="genderOther" value={formData.genderOther} onChange={handleInputChange} placeholder="請輸入" className="w-full p-3  rounded-md outline-hidden border border-accent-500 focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-colors" />)}
                                </div>
                            )}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className=' grid grid-cols-2 gap-x-3 gap-y-4'>
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
                                        <label key={option} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.attendedFair === option ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="attendedFair" value={option} checked={formData.attendedFair === option} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-gray-700 font-medium">{option}</span></label>
                                    ))}
                                </div>
                            )}
                            {currentStep === 5 && (
                                <div className="space-y-3">
                                    <p className="text-primary-700 mb-4">您是否有（或預計要）參加社團聯展？</p>
                                    {['有', '沒有'].map(option => (
                                        <label key={option} className={`flex items-center p-3 rounded-md border hover:border-accent-500 ${formData.attendedExhibition === option ? " bg-primary-50 border-accent-500" : " border-primary-50"} cursor-pointer transition-colors`}><input type="radio" name="attendedExhibition" value={option} checked={formData.attendedExhibition === option} onChange={handleInputChange} className="hidden" /><span className="ml-3 text-gray-700 font-medium">{option}</span></label>
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
                    {currentStep === 0 ? (
                        <div className="w-1/5"></div>
                    ) : (
                        <button type="button" onClick={handleBack} disabled={currentStep === 0} className={`w-1/5 px-4 py-2 h-10 text-sm font-medium rounded-md bg-primary-50 transition-transform hover:-translate-y-0.5 hover:scale-[1.01] ${currentStep === 0 ? 'opacity-0 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}>
                            <ChevronLeft className='inline-block' />
                        </button>
                    )}

                    {currentStep < totalSteps ? (
                        <button onClick={handleNext} className="w-4/5 px-4 py-2 h-10 text-base bg-accent-500 text-white rounded-md transition-transform hover:-translate-y-0.5 hover:scale-[1.02]">
                            下一題
                            <ChevronRight className='inline-block mb-0.5' />
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