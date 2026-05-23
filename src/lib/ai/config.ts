export function getConfig() {
  const volcanoKey = process.env.VOLCANO_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  if (!volcanoKey) throw new Error("VOLCANO_API_KEY is not set");
  if (!deepseekKey) throw new Error("DEEPSEEK_API_KEY is not set");

  return {
    volcanoApiKey: volcanoKey,
    deepseekApiKey: deepseekKey,
    seedreamBaseUrl:
      "https://operator.las.cn-beijing.volces.com/api/v1/images/generations",
    doubaoVisionBaseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    deepseekBaseUrl: "https://api.deepseek.com",
    seedreamModel: "doubao-seedream-4-5-251128",
    doubaoVisionModel: "doubao-seed-2-0-lite-260215",
    deepseekModel: "deepseek-chat",
  };
}
