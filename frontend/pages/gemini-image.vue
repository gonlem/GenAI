<script setup>
import * as Vue from 'vue';
import { GoogleGenAI } from "@google/genai";

const geminiai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const ai_request = Vue.ref('');
const ai_response = Vue.ref('');
const ai_response_image = Vue.ref('');
const ai_model = Vue.ref('gemini-3.1-flash-lite-image');
const ai_service_tier = Vue.ref('flex'); // "flex" | "standard" | "priority"
const ai_aspect_ratio = Vue.ref('16:9');
const ai_image_size = Vue.ref('1K'); // "512" | "1K" | "2K" | "4K"

async function callApi() {
    try {
        ai_response.value = 'Loading...';
        let startTime = Date.now();
        const response = await geminiai.models.generateContent({
            model: ai_model.value,
            contents: ai_request.value,
            config: {
                serviceTier: ai_service_tier.value,
                responseModalities: ['Image'],
                imageConfig: {
                    aspectRatio: ai_aspect_ratio.value,
                    imageSize: ai_image_size.value
                }
            }
        });
        let endTime = Date.now();
        let responseText = `[Response time: ${(endTime - startTime) / 1000} seconds]\n`;
        responseText += `[Model: ${response.modelVersion}]\n`;
        responseText += `[Service tier: ${response.usageMetadata.serviceTier}]\n`;
        responseText += `[Input tokens: ${response.usageMetadata.promptTokenCount}]\n`;
        responseText += `[Output tokens: ${(response.usageMetadata.candidatesTokenCount)}]\n`;
        responseText += `[Total tokens: ${response.usageMetadata.totalTokenCount}]\n`;
        const cost = getEstimatedCost(response.usageMetadata.promptTokenCount, response.usageMetadata.totalTokenCount - response.usageMetadata.promptTokenCount);
        responseText += `[Estimated cost: €${cost.toFixed(6)}]\n`;

        ai_response.value = responseText;
        ai_response_image.value = response.data;
    } catch (error) {
        ai_response.value = `Error: ${error.message}`;
    }
}

function getEstimatedCost(inputTokens, outputTokens) {
    let cost = 0.0;
    switch (ai_model.value) {
        case 'gemini-3.1-flash-image':
            cost = (0.50 * inputTokens + 60 * outputTokens) / 1000000;
            break;
        case 'gemini-3.1-flash-lite-image':
            cost = (0.25 * inputTokens + 30 * outputTokens) / 1000000;
            break;
        default:
            cost = 0.0;
    }
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
                    <option>gemini-3.1-flash-lite-image</option>
                    <option>gemini-3.1-flash-image</option>
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
                <span>Image Ratio</span>
                <select name="image_ratio" v-model="ai_aspect_ratio" required>
                    <option>16:9</option>
                    <option>4:3</option>
                    <option>1:1</option>
                    <option>4:1</option>
                </select>
            </label>
            <label>
                <span>Image Size</span>
                <select name="image_size" v-model="ai_image_size" required>
                    <option>512</option>
                    <option>1K</option>
                    <option>2K</option>
                    <option>4K</option>
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
    <div class="flex-row">
        <div class="flex-column">
            <label v-if="ai_response_image">
                <span>Generated Image</span>
                <img :src="'data:image/jpeg;base64,' + ai_response_image" alt="Generated Image" />
            </label>
        </div>
    </div>
</template>

<style scoped>
@import "../assets/base.css";

textarea {
    min-width: 100%;
    min-height: 20rem;
    field-sizing: content;
}
</style>