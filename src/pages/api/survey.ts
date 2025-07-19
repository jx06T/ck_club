import type { APIRoute } from 'astro';
import { db } from '../../firebase/server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
      const surveyData = await request.json();
      console.log(surveyData);

    const requiredFields = ['school', 'grade', 'gender', 'source', 'attendedExhibition', 'attendedFair'];
    const missingFields = requiredFields.filter(field => surveyData[field] === undefined);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ message: `缺少必要欄位: ${missingFields.join(', ')}` }),
        { status: 400 }
      );
    }
    
    await db.collection('surveyResponses').add({
      ...surveyData,
      submittedAt: new Date(),
    });

    return new Response(JSON.stringify({ message: "問卷提交成功" }), {
      status: 201, // 201 Created
    });

  } catch (error) {
    console.error("提交問卷時發生錯誤:", error);
    return new Response(JSON.stringify({ message: "伺服器內部錯誤" }), { status: 500 });
  }
};