export function getConfig() {
  const volcanoKey = process.env.VOLCANO_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  if (!volcanoKey) throw new Error("VOLCANO_API_KEY is not set");
  if (!deepseekKey) throw new Error("DEEPSEEK_API_KEY is not set");

  return {
    volcanoApiKey: volcanoKey,
    deepseekApiKey: deepseekKey,
    seedreamBaseUrl:
      "https://ark.cn-beijing.volces.com/api/v3/images/generations",
    doubaoVisionBaseUrl: "https://ark.cn-beijing.volces.com/api/v3/responses",
    deepseekBaseUrl: "https://api.deepseek.com",
    seedreamModel: "doubao-seedream-5-0-260128",
    doubaoVisionModel: "doubao-seed-2-0-mini-260428",
    deepseekModel: "deepseek-chat",
  };
}
