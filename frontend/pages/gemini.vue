<script setup>
import * as Vue from 'vue';
import { GoogleGenAI } from "@google/genai";

const geminiai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const ai_request = Vue.ref('');
const ai_response = Vue.ref('');
const ai_model = Vue.ref('gemini-3.1-flash-lite');
const ai_reasoning_effort = Vue.ref('low'); // "minimal" | "low" | "medium" | "high"
const ai_service_tier = Vue.ref('flex'); // "flex" | "standard" | "priority"
const ai_temperature = Vue.ref(1.0);
const ai_web_search = Vue.ref('no'); // "yes" | "no"
const ai_store = Vue.ref('yes'); // "yes" | "no"

async function callApi() {
    try {
        ai_response.value = 'Loading...';
        let startTime = Date.now();
        const response = await geminiai.models.generateContent({
            model: ai_model.value,
            contents: ai_request.value,
            config: {
                thinkingConfig: {
                    thinkingLevel: ai_reasoning_effort.value
                },
                temperature: ai_temperature.value,
                tools: ai_web_search.value === 'yes' ? [{ googleSearch: {} }] : [],
                serviceTier: ai_service_tier.value,
            }
        });
        let endTime = Date.now();
        let responseText = `[Response time: ${(endTime - startTime) / 1000} seconds]\n`;
        responseText += `[Model: ${response.modelVersion}]\n`;
        responseText += `[Reasoning effort: ${ai_reasoning_effort.value}]\n`;
        responseText += `[Temperature: ${ai_temperature.value}]\n`;
        responseText += `[Service tier: ${response.usageMetadata.serviceTier}]\n`;
        responseText += `[Input tokens: ${response.usageMetadata.promptTokenCount}]\n`;
        responseText += `[Reasoning tokens: ${response.usageMetadata.thoughtsTokenCount}]\n`;
        responseText += `[Output tokens: ${(response.usageMetadata.candidatesTokenCount)}]\n`;
        responseText += `[Total tokens: ${response.usageMetadata.totalTokenCount}]\n\n`;
        const cost = getEstimatedCost(response.usageMetadata.promptTokenCount, response.usageMetadata.totalTokenCount - response.usageMetadata.promptTokenCount);
        responseText += `[Estimated cost: €${cost.toFixed(6)}]\n\n`;
        responseText += response.text;
        ai_response.value = responseText;
    } catch (error) {
        ai_response.value = `Error: ${error.message}`;
    }
}

function getEstimatedCost(inputTokens, outputTokens) {
    let cost = 0.0;
    switch (ai_model.value) {
        case 'gemini-3.5-flash':
            cost = (1.50 * inputTokens + 9.00 * outputTokens) / 1000000;
            break;
        case 'gemini-3.1-flash-lite':
            cost = (0.25 * inputTokens + 1.50 * outputTokens) / 1000000;
            break;
        default:
            cost = 0.0;
    }
    cost = ai_service_tier.value === 'flex' ? cost / 2 : cost;
    return cost;
}
</script>

<template>
    <div class="flex-row">
        <div class="flex-column">
            <label>
                <span>Request</span>
                <textarea name="request" v-model="ai_request"></textarea>
            </label>
        </div>
        <div class="flex-column fit-content">
            <label>
                <span>Model</span>
                <select name="model" v-model="ai_model" required>
                    <option>gemini-3.5-flash</option>
                    <option>gemini-3.1-flash-lite</option>
                </select>
            </label>
            <label>
                <span>Effort</span>
                <select name="reasoning_effort" v-model="ai_reasoning_effort" required>
                    <option>minimal</option>
                    <option>low</option>
                    <option>medium</option>
                    <option>high</option>
                </select>
            </label>
            <label>
                <span>Service Tier</span>
                <select name="service_tier" v-model="ai_service_tier" required>
                    <option>flex</option>
                    <option>standard</option>
                    <option>priority</option>
                </select>
            </label>
            <label>
                <span>Temperature</span>
                <input name="temperature" type="number" min="0" max="2" step="0.1" v-model="ai_temperature" />
            </label>
            <label>
                <span>Web Search</span>
                <select name="web_search" v-model="ai_web_search" required>
                    <option>yes</option>
                    <option>no</option>
                </select>
            </label>
            <label>
                <span>Store</span>
                <select name="store" v-model="ai_store" required>
                    <option>yes</option>
                    <option>no</option>
                </select>
            </label>
            <button @click="callApi()">Call API</button>
        </div>
        <div class="flex-column">
            <label>
                <span>Response</span>
                <textarea name="response">{{ ai_response }}</textarea>
            </label>
        </div>
    </div>
</template>

<style scoped>
@import "../assets/base.css";

textarea {
    min-width: 100%;
    min-height: 30rem;
    field-sizing: content;
}
</style>