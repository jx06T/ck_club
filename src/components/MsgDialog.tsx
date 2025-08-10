import { createRoot } from 'react-dom/client';

function createMsgDialog(title: string, message: string, onConfirm: Function, confirmText = "Confirm"): void {

    const dialogRoot = document.createElement('div');
    document.body.appendChild(dialogRoot);

    const root = createRoot(dialogRoot);

    const MsgDialog = () => {
        const handleConfirm = () => {
            onConfirm();
            root.unmount();
            document.body.removeChild(dialogRoot);
        };


        return (
            <div className="z-50 msg-dialog-overlay flex justify-center fixed w-full top-36 left-1 right-1 px-4 pl-2 ">
                <div className="msg-dialog max-w-[92%] min-w-96 bg-neutral-100 p-6 rounded-lg shadow shadow-primary-100">
                    <h1 className='text-xl'>{title}</h1>
                    <pre className=' text-wrap whitespace-pre-wrap mt-3  min-h-28'>{message}</pre>
                    <div className=' w-full flex justify-end space-x-6'>
                        <button className=' cursor-pointer px-2 rounded-full border-2 border-accent-500 hover:bg-accent-300' onClick={handleConfirm}>{confirmText}</button>
                    </div>
                </div>
            </div>
        );
    };

    root.render(<MsgDialog />);
};

export default createMsgDialog
