import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const testData = [
    {
        "timestamp": "2025-07-07T18:35:19",
        "email": "ck11300874@gl.ck.tp.edu.tw",
        "clubId": "A06",
        "clubName": "航空社",
        "content": "測試訊息！",
        "link": "https://www.instagram.com/ck_club_exhibition__/"
    },
    {
        "timestamp": "2025-07-07T19:00:00",
        "email": "ck11300234@gl.ck.tp.edu.tw",
        "clubId": "B01",
        "clubName": "攝影社",
        "content": "本週五社課改至 E204 教室。",
        "link": "https://ck-photoclub.example.com"
    },
    {
        "timestamp": "2025-07-07T19:15:42",
        "email": "ck11300999@gl.ck.tp.edu.tw",
        "clubId": "C02",
        "clubName": "動漫社",
        "content": "社課延期至下週，請見 IG 公告。",
        "link": "https://instagram.com/ck_anime_club"
    },
    {
        "timestamp": "2025-07-07T19:30:11",
        "email": "ck11300111@gl.ck.tp.edu.tw",
        "clubId": "A01",
        "clubName": "圍棋社",
        "content": "今日社課開放新社員試玩！",
        "link": ""
    },
    {
        "timestamp": "2025-07-07T19:45:00",
        "email": "ck11300789@gl.ck.tp.edu.tw",
        "clubId": "B04",
        "clubName": "機研社",
        "content": "機器人展演報名開始！",
        "link": "https://ckmech.example.com"
    },
    {
        "timestamp": "2025-07-07T20:00:00",
        "email": "ck11300555@gl.ck.tp.edu.tw",
        "clubId": "C01",
        "clubName": "文藝社",
        "content": "徵文比賽徵稿延長至 7/20 止。",
        "link": ""
    },
    {
        "timestamp": "2025-07-07T20:10:25",
        "email": "ck11300666@gl.ck.tp.edu.tw",
        "clubId": "B07",
        "clubName": "西樂社",
        "content": "歡迎參加音樂交流會！",
        "link": "https://music-club.ck.edu.tw"
    }
]

interface Props {
    id: string;
}

function formatTimestamp(isoString: string): string {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
}

function News({ id }: Props) {
    const [currentPage, setCurrentPage] = useState(0);
    const [newsInPage, setNewsInPage] = useState(testData.slice(0, 5));

    const itemsPerPage = 4;
    const totalPages = Math.ceil(testData.length / itemsPerPage);

    useEffect(() => {
        setNewsInPage(testData.slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage));
    }, [currentPage]);

    const nextPage = () => {
        if ((currentPage + 1) * itemsPerPage < testData.length) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <section className=' pt-6 pb-10'>
            <h1 id={id} className='block text-balance text-3xl lg:text-4xl font-bold tracking-tight mb-6'>
                最新訊息
            </h1>

            <div className="rounded-md /bg-primary-50/50 overflow-hidden h-[66vh]">
                <div className="px-4 md:px-6 py-4 border-b border-accent-600">
                    <div className="grid grid-cols-[2.4fr_1.2fr_1fr] items-center text-base font-semibold text-primary-700 ">
                        <span >內容</span>
                        <span >社團</span>
                        <span >時間</span>
                    </div>
                </div>

                {newsInPage.map((news, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-[2.4fr_1.2fr_1fr] items-center px-4 md:px-6 py-4 text-base hover:bg-primary-100/50 "
                    >
                        <div className="pr-4 ">
                            <p className="text-primary-700 font-medium line-clamp-2">{news.content}</p>
                            {news.link && (
                                <a
                                    href={news.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-500 text-base mt-1 hover:underline"
                                >
                                    詳細訊息
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                        <div className="pr-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border border-accent-600 text-primary-700 ">
                                {news.clubName}
                            </span>
                        </div>
                        <p className="text-primary-700 font-mono text-sm">{formatTimestamp(news.timestamp)}</p>

                    </div>
                ))}
            </div>

            <div className="mt-5 px-4 md:px-6 flex justify-between items-center">
                <div className="text-base text-gray-500 ">
                    第 {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, testData.length)} 筆，
                    共 {testData.length} 筆
                </div>
                <div className="flex items-center gap-3">
                    <button
                        disabled={currentPage === 0}
                        onClick={prevPage}
                        className="inline-flex items-center px-3 py-1 rounded-lg hover:bg-accent-200 bg-accent-300  disabled:bg-primary-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        <span className=" hidden md:block">上一頁</span>
                    </button>
                    <span className="text-base text-gray-500">
                        {currentPage + 1} / {totalPages}
                    </span>
                    <button
                        disabled={(currentPage + 1) * itemsPerPage >= testData.length}
                        onClick={nextPage}
                        className="inline-flex items-center px-3 py-1 rounded-lg hover:bg-accent-200 bg-accent-300  disabled:bg-primary-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className=" hidden md:block">下一頁</span>
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default News;