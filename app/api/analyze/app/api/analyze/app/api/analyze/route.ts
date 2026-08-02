import { NextResponse } from "next/server";

export async function POST(req: Request) {
try {
const formData = await req.formData();
const file = formData.get("file") as File;

if (!file) {
return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
}

const arrayBuffer = await file.arrayBuffer();
const base64 = Buffer.from(arrayBuffer).toString("base64");

const res = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
contents: [
{
parts: [
{
text: "この領収書・レシート画像から『日付(YYYY/MM/DD)』『総売上金額(数値)』『客数(数値)』『現金(数値)』『クレジットカード(数値)』『QR決済(数値)』『その他(数値)』を抽出し、以下のJSON形式のみで返してください。余計な解説は不要です。{\n \"date\": \"YYYY/MM/DD\",\n \"total\": 0,\n \"customers\": 0,\n \"cash\": 0,\n \"credit\": 0,\n \"qr\": 0,\n \"other\": 0\n}",
},
{
inlineData: {
mimeType: file.type || "image/jpeg",
data: base64,
},
},
],
},
],
}),api/analyze/route.ts⁠
}
);

const data = await res.json();
const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
const cleanJson = text.replace(/```json|```/g, "").trim();
const parsed = JSON.parse(cleanJson);

return NextResponse.json(parsed);
} catch (error) {
return NextResponse.json({ error: "解析エラー" }, { status: 500 });
}
}
