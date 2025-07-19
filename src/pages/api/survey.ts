import type { APIRoute } from 'astro';
import { db } from '../../firebase/server';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log("問卷後端被戳")
    const surveyData = await request.json();

    // 可以加上一些基本的驗證
    if (!surveyData || Object.keys(surveyData).length === 0) {
      return new Response("Survey data cannot be empty", { status: 400 });
    }

    // 將數據寫入 Firestore
    const surveyCollection = db.collection('surveyResponses');
    await surveyCollection.add({
      ...surveyData,
      submittedAt: new Date(),
    });

    return new Response(JSON.stringify({ message: "Survey submitted successfully" }), {
      status: 201, // 201 Created
    });
  } catch (error) {
    console.error("Error submitting survey:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};