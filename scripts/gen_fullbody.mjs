import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

/* Generate professional full-body renders of the user from his real photos.
   Uses BOTH portrait (navy suit headshot) and selfie as identity references.
   Chroma-green background for clean keying, portrait 768x1344. */

const OUT = "/home/z/my-project/scripts/assets";
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  {
    name: "fullbody_suit",
    refs: [
      "/home/z/my-project/public/photos/portrait.jpg",
      "/home/z/my-project/public/photos/selfie.jpg",
    ],
    prompt:
      "Full body professional studio photograph of this exact same young Indian man, keep his face, hairstyle, beard and identity exactly identical to the reference photos. Standing tall in a confident relaxed pose facing the camera, entire body visible from head to formal shoes, wearing a tailored navy blue formal suit with crisp white shirt, arms relaxed at sides. Cinematic soft rim studio lighting, sharp focus, premium editorial fashion photography. Isolated on a completely flat solid chroma green background, uniform pure green color everywhere behind him, no shadows cast on the background, subject centered with clear margin above head and below shoes.",
  },
  {
    name: "fullbody_crossed",
    refs: [
      "/home/z/my-project/public/photos/portrait.jpg",
      "/home/z/my-project/public/photos/selfie.jpg",
    ],
    prompt:
      "Full body professional studio photograph of this exact same young Indian man, keep his face, hairstyle, beard and identity exactly identical to the reference photos. Standing in a confident pose with arms crossed over his chest, entire body visible from head to formal shoes, wearing a tailored dark navy blue formal suit with crisp white shirt. Cinematic soft rim studio lighting, sharp focus, premium editorial fashion photography. Isolated on a completely flat solid chroma green background, uniform pure green color everywhere behind him, no shadows cast on the background, subject centered with clear margin above head and below shoes.",
  },
];

function toDataUrl(p) {
  const b = fs.readFileSync(p);
  return `data:image/jpeg;base64,${b.toString("base64")}`;
}

const zai = await ZAI.create();

for (const job of jobs) {
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      console.log(`→ ${job.name} attempt ${attempt}`);
      const res = await zai.images.generations.edit({
        prompt: job.prompt,
        images: job.refs.map((r) => ({ url: toDataUrl(r) })),
        size: "768x1344",
      });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) throw new Error("no base64 in response");
      fs.writeFileSync(`${OUT}/${job.name}.png`, Buffer.from(b64, "base64"));
      console.log(`✓ saved ${OUT}/${job.name}.png`);
      ok = true;
    } catch (e) {
      console.error(`✗ ${job.name} attempt ${attempt}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  if (!ok) console.error(`FAILED: ${job.name}`);
}
console.log("done");
