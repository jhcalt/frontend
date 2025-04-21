import { LlmMessage } from "~/components/Chatbot/ChatConvoComponents/ChatBubbles";
import { getJwtAccess } from "../auth/cookieUtils";
import { setContainerTechStack, setContainerServerStack } from "../dashboard/dashboardUtils_redis";
import { redis } from "../../tools/redisClient";

const API_CALLING_SYSTEM_PROMPT = `
You are an AI assistant that helps users deploy their code. Your task is to analyze the conversation history and decide whether to call one of the following functions:

**Available Functions:**
2. \`set_techstack(ai_response: str)\`  
   - Description: Call after user explicitly confirms the proposed tech stack. Ensure user's latest message is only the techstack confirmation
   - Parameter:  
      - \`ai_response\`: The AI's message that contains the tech stack details.  
   - Example Trigger:  
     - AI: "To confirm, your stack is: \`backend: php, frontend: html+css+javascript, database: cassandra\`. Is this accurate?"  
     - User: "Yes, that's right."

3. \`set_serverstack(ai_response: str)\`  
   - Description: Call after user explicitly confirms the proposed server requirements. Ensure user's latest message is only the requirements confirmation.
   - Parameter:  
      - \`ai_response\`: The AI's message that contains the tech stack details.  
   - Example Trigger:  
     - AI: "Got it. Your requirements are: \`cpu: 1, mem: 25gb, ram: 8gb\`. Ready to start deployment?"  
     - User: "Yes, proceed."

**Instructions:**
1. Analyze the conversation history to determine if a function should be called.
2. If a function should be called, generate a JSON object with the function name and any required parameters.
3. If no function should be called, output \`null\`.

**Input Format:**
Array of {role, content} objects where role is 'assistant'|'user'. Last object has role:'user'
**Output Format:**

If a function should be called, output a JSON object like this:
\`\`\`json
{
  function: "<function_name>",
  parameters: {}
}
\`\`\`
`;

export async function apiCallerLLm(messages: LlmMessage[],containerName : string, username: string, jwtAccess: string, topic: string) {

    // console.log("API CALLER INPUT: ", messages);
    const fireworksBody = {
        model: "accounts/fireworks/models/deepseek-v3",
        max_tokens: 4096,
        top_p: 1,
        top_k: 40,
        presence_penalty: 0,
        frequency_penalty: 0,
        temperature: 0.6,
        messages: [
            {
                role : "system",
                content : API_CALLING_SYSTEM_PROMPT
              },
              {
                role: "user",
                content : JSON.stringify(messages)
              }
        ]
    }

    const fireworksResponse = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
        },
        body: JSON.stringify(fireworksBody)
      });

    const responseData = await fireworksResponse.json();

    // console.log("API CALLER RESPONSE", responseData);

    console.log("API CALLER FIREWORKS RESPONSE: ", responseData.choices?.[0]?.message?.content);
    await parseApiCallerLlmOutput(responseData.choices?.[0]?.message?.content,containerName, username, jwtAccess, topic);
}

async function parseApiCallerLlmOutput(output : string, containerName: string, username: string, jwtAccess: string, topic: string) {
  // Clean up input by removing three backticks and 'json' word
  const cleanInput = output.replace(/```json|```/g, '').trim();
  
  // If it's 'null', return null
  if (cleanInput === 'null') {
      return null;
  }
  
  try {
      const parsedData = JSON.parse(cleanInput);
      
      switch (parsedData.function) {
          case 'set_techstack': {
              // First check if we've already processed tech stack for this topic
              const techStackProcessedKey = `techstack_processed:${username}:${topic}`;
              
              // Check if already processed
              const alreadyProcessed = await redis.get(techStackProcessedKey);
              console.log("Checking if tech stack already processed:", alreadyProcessed);
              if (alreadyProcessed === "true") {
                  console.log("Tech stack already processed for this topic, skipping");
                  break;
              }

              const response = parsedData.parameters.ai_response;
              // Find content between backticks
              const match = response.match(/`([^`]+)`/);
              if (!match) {
                  console.log("No tech stack data found in response");
                  return null;
              }
              
              const techString = match[1];
              // Extract values using regex
              const backend = techString.match(/backend:\s*([^,]+)/)?.[1]?.trim();
              const frontend = techString.match(/frontend:\s*([^,]+)/)?.[1]?.trim();
              const database = techString.match(/database:\s*([^,\s]+)/)?.[1]?.trim();
              console.log("TECH STACK DETECTED - BACKEND:", backend, "FRONTEND:", frontend, "DATABASE:", database);
              
              if (!backend || !frontend || !database) {
                  console.log("Missing required tech stack parameters");
                  return null;
              }
              
              try {
                  console.log("Attempting to set tech stack...");
                  // Process tech stack
                  await setContainerTechStack(username, topic, containerName, frontend, backend, database);
                  console.log("Tech stack successfully set!");
                  
                  // Mark as processed (store for 30 minutes)
                  await redis.setex(techStackProcessedKey, 30 * 60, "true");
                  console.log("Tech stack marked as processed");
              } catch (error) {
                  console.error("Error setting tech stack:", error);
                  // Don't mark as processed if there's an error
              }
              break;
          }
          case 'set_serverstack': {
              // Check if we've already processed server stack for this topic, but don't block processing
              // because we still need to ensure Docker container creation happens
              const serverStackProcessedKey = `serverstack_processed:${username}:${topic}`;
              
              // Check if already processed - but only for logging purposes
              const alreadyProcessed = await redis.get(serverStackProcessedKey);
              console.log("Server stack processing status:", alreadyProcessed ? "previously processed" : "not yet processed");

              const response = parsedData.parameters.ai_response;
              // Find content between backticks
              const match = response.match(/`([^`]+)`/);
              if (!match) {
                  console.log("No server stack data found in response");
                  return null;
              }
              
              const serverString = match[1];
              // Extract values using regex
              const ram = serverString.match(/ram:\s*([^,]+)/)?.[1]?.trim();
              const mem = serverString.match(/mem:\s*([^,]+)/)?.[1]?.trim();
              const cpu = serverString.match(/cpu:\s*([^,\s]+)/)?.[1]?.trim();
              
              console.log("SERVER STACK DETECTED - RAM:", ram, "MEM:", mem, "CPU:", cpu);
              
              if (!ram || !mem || !cpu) {
                  console.log("Missing required server stack parameters");
                  return null;
              }
              
              try {
                  console.log("Attempting to set server stack...");
                  await setContainerServerStack(username, jwtAccess, topic, ram, mem, cpu);
                  console.log("Server stack successfully set!");
                  
                  // Mark as processed (store for 30 minutes)
                  await redis.setex(serverStackProcessedKey, 30 * 60, "true");
                  console.log("Server stack marked as processed");
              } catch (error) {
                  console.error("Error setting server stack:", error);
                  // Don't mark as processed if there's an error
              }
              break;
          }
          default:
              return null;
      }
  } catch (error) {
      return null;
  }
}
