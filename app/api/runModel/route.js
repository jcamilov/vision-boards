import axios from "axios";

export async function POST(req) {
  const { mode, modelParams } = await req.json();

  const url =
    mode === "inpaint"
      ? `https://api.segmind.com/v1/flux-inpaint`
      : `https://api.segmind.com/v1/fast-flux-schnell`;

  console.log("mode to run:", mode);
  console.log("prompt to run:", modelParams.prompt);

  try {
    const response = await axios.post(url, modelParams, {
      headers: { "x-api-key": process.env.SEGMIND_API_KEY },
      responseType: "arraybuffer",
    });

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    const dataURI = `data:image/jpeg;base64,${base64Image}`;

    return new Response(JSON.stringify({ image: dataURI }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calling Segmind API:", error);
    return new Response(JSON.stringify({ error: "Failed to generate image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
