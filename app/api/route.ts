import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
try {
const data = await request.json();
const image = data.image;

if (!image) {
return NextResponse.json({ error: '画像が見つかりません' }, { status: 400 });
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

const response = await ai.models.generateContent({
model: 'gemini-2.5-flash',
contents: [
{
inlineData: {
data: base64Data,
mimeType: 'image/jpeg',
},
},
{
text: 'この売上表・日報の画像を読み取り、店舗名、日付、売上金額や数値データを抽出して構造化してください。',
},
],
});

return NextResponse.json({ result: response.text });
} catch (error: any) {
console.error('API Error:', error);
return NextResponse.json({ error: error.message || 'サーバーエラーが発生しました' }, { status: 500 });
}
}