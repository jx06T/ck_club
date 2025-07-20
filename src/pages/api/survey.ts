import type { APIRoute } from 'astro';
import { addDocument } from '../../firebase/services';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const surveyData = await request.json();

        const requiredFields = ['school', 'grade', 'gender', 'source', 'attendedExhibition', 'attendedFair'];
        const missingFields = requiredFields.filter(field => surveyData[field] === undefined || surveyData[field] === '');

        if (missingFields.length > 0) {
            return new Response(
                JSON.stringify({ message: `缺少必要欄位: ${missingFields.join(', ')}` }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const dataToSubmit = {
            ...surveyData,
            submittedAt: new Date(),
        };

        await addDocument('surveyResponses', dataToSubmit);

        return new Response(
            JSON.stringify({ message: "問卷提交成功" }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error("在 API 路由中提交問卷時發生錯誤:", error);

        return new Response(
            JSON.stringify({ message: "伺服器內部錯誤，請稍後再試" }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};