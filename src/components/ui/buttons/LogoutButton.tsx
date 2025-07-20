import { LogosGoogleIcon } from '@components/ui/Icons'
import { useAuth } from '@/scripts/useAuth';


function LogoutButton() {
    const { user, isLoading, signOut } = useAuth();

    const handleClearAuth = async () => {
        await signOut();
        console.log("Client-side authentication cleared.");
    };

    if (isLoading) {
        return <div className="text-sm text-primary-900">驗證狀態讀取中...</div>;
    }

    if (user) {
        return (
            <div className="text-sm text-primary-900 flex items-center gap-2">
                <span><LogosGoogleIcon className=' inline-block mr-1 mb-1 w-4 h-4' />已驗證 {'( ' + user.displayName + ' )' || ''}</span>
                <span>|</span>
                <button
                    onClick={handleClearAuth}
                    className='underline hover:text-accent-500 transition-colors'
                >
                    清除身分驗證
                </button>
            </div>
        );
    }

    return null;
}
export default LogoutButton;
