import CardTemplate from '@/assets/card-background.svg?react';
import S1 from '@/assets/stamps/s1.svg?react';
import S2 from '@/assets/stamps/s2.svg?react';
import S3 from '@/assets/stamps/s3.svg?react';
import S4 from '@/assets/stamps/s4.svg?react';
import S5 from '@/assets/stamps/s5.svg?react';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

const Ss = [<S1 className=' w-full h-full' />, <S2 className=' w-full h-full' />, <S3 className=' w-full h-full' />, <S4 className=' w-full h-full' />, <S5 className=' w-full h-full' />]
interface CardDesignerProps {
    clubName: string;
    clubCode: string;
    stampId: number;
    mapId: string;
    summary: string;
    shareUrl: string;
}

function CardDesigner({ clubName, clubCode, stampId, mapId, summary, shareUrl }: CardDesignerProps) {
    const [qrCodeDataURL, setQrCodeDataURL] = useState('');
    useEffect(() => {
        const generateQR = async () => {
            const url = await QRCode.toDataURL(shareUrl, { width: 768, margin: 0, color: { dark: "#171e2a", light: "#fcfcfc" } });
            setQrCodeDataURL(url);
        };
        generateQR();
    }, [shareUrl]);
    useEffect(() => {

        // alert(stampId)
    }, [stampId])

    return (
        <div className="relative w-[210mm] h-[297mm] scale-[0.6] -translate-y-12 origin-top ">
            <CardTemplate className="absolute inset-0 w-full h-full" />

            <div className="absolute inset-0 text-black">
                {qrCodeDataURL && (
                    <img
                        src={qrCodeDataURL}
                        alt="QR Code"
                        className="absolute"
                        style={{ top: '58.5mm', left: '42.8mm', width: '124.4mm', height: '124.4mm' }}
                    />
                )}

                <div
                    className="absolute /bg-red-300 border-[19px] border-[#fcfcfc] rounded-4xl"
                    style={{ top: '54mm', left: '38mm', width: '134mm', height: '134mm' }}
                >

                </div>

                <div
                    className="absolute text-7xl font-bold text-[#171e2a]"
                    style={{ top: '10mm', left: '70mm', width: '130mm', letterSpacing: '1mm', lineHeight: '1' }}
                >
                    {clubName}
                </div>

                <div
                    className="absolute text-[5.2rem] font-bold text-[#ec9f65]"
                    style={{ top: '4mm', left: '10mm', letterSpacing: '1mm' }}
                >
                    {clubCode}
                </div>

                <div
                    className="absolute text-[2.6rem] font-bold text-white"
                    style={{ top: '190mm', left: '189mm', letterSpacing: '1mm' }}
                >
                    {stampId && ["無","Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"][stampId]}
                </div>


                <div
                    className="absolute text-[2.6rem] font-bold text-white"
                    style={{ top: '210mm', left: '156mm', width: '41mm' }}
                >
                    {stampId && Ss[stampId]}
                </div>

                <div
                    className="absolute text-4xl font-bold text-white"
                    style={{ top: '216mm', left: '117mm', letterSpacing: '1.3px' }}
                >
                    {mapId.slice(5, mapId.length)}
                </div>
                <div
                    className="absolute text-xl font-light text-white"
                    style={{ top: '247.5mm', left: '9.5mm', width: '134mm', letterSpacing: '0.9mm', lineHeight: '8.1mm' }}
                >
                    {summary.slice(0, 42)}
                </div>
                <div
                    className="absolute text-xl font-light text-white"
                    style={{ top: '263.8mm', left: '9.5mm', width: '195mm', letterSpacing: '0.9mm', lineHeight: '8.1mm' }}
                >
                    {summary.slice(42, 130)}<span className=' inline-block ml-0.5'>{summary.length > 130 && "..."}</span>
                </div>

                <div
                    className="absolute text-lg font-light text-[#4e5580]"
                    style={{ top: '44mm', left: '4mm', letterSpacing: '0.9mm',transform:'rotate(90deg)',transformOrigin:"left" }}
                >
                    {shareUrl}
                </div>
            </div>
        </div>
    );
}
export default CardDesigner;