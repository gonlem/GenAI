<script setup>
import * as Vue from 'vue';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true
});

const ai_request = Vue.ref('');
const ai_response = Vue.ref('');
const ai_response_image = Vue.ref('');
const ai_model = Vue.ref('gpt-image-2');
const ai_moderation = Vue.ref('low'); // "auto" | "low"
const ai_image_size = Vue.ref('1536x512'); // "auto" | "1024x1024" | "1536x1024" | "1024x1536"
const ai_image_output_format = Vue.ref('png'); // "png" | "jpeg" | "webp"
const ai_image_quality = Vue.ref('low'); // "auto" | "low" | "medium" | "high"

async function callApi() {
    try {
        ai_response.value = 'Loading...';
        let startTime = Date.now();
        const response = await openai.images.generate({
            model: ai_model.value,
            prompt: ai_request.value,
            moderation: ai_moderation.value,
            size: ai_image_size.value,
            quality: ai_image_quality.value,
            output_format: ai_image_output_format.value,
            n: 1,
        });
        let endTime = Date.now();
        let responseText = `[Response time: ${(endTime - startTime) / 1000} seconds]\n`;
        responseText += `[Model: ${ai_model.value}]\n`;
        responseText += `[Moderation: ${ai_moderation.value}]\n`;
        responseText += `[Image size: ${response.size}]\n`;
        responseText += `[Image quality: ${response.quality}]\n`;
        responseText += `[Image output format: ${response.output_format}]\n`;
        responseText += `[Input tokens: ${response.usage.input_tokens}]\n`;
        responseText += `[Output tokens: ${response.usage.output_tokens}]\n`;
        responseText += `[Total tokens: ${response.usage.total_tokens}]\n`;
        const cost = getEstimatedCost(response.usage.input_tokens, response.usage.output_tokens);
        responseText += `[Estimated cost: €${cost.toFixed(6)}]\n`;

        ai_response.value = responseText;
        ai_response_image.value = response.data[0].b64_json;
    } catch (error) {
        ai_response.value = `Error: ${error.message}`;
    }
}

function getEstimatedCost(inputTokens, outputTokens) {
    let cost = 0.0;
    switch (ai_model.value) {
        case 'gpt-image-2':
            cost = (5 * inputTokens + 30 * outputTokens) / 1000000;
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
                    <option>gpt-image-2</option>
                </select>
            </label>
            <label>
                <span>Moderation</span>
                <select name="moderation" v-model="ai_moderation" required>
                    <option>auto</option>
                    <option>low</option>
                </select>
            </label>
            <label>
                <span>Image size</span>
                <select name="image_size" v-model="ai_image_size" required>
                    <option>auto</option>
                    <option>1536x512</option>
                    <option>3072x1024</option>
                    <option>1024x1024</option>
                    <option>1536x1024</option>
                    <option>1024x1536</option>
                </select>
            </label>
            <label>
                <span>Image quality</span>
                <select name="image_quality" v-model="ai_image_quality" required>
                    <option>auto</option>
                    <option>low</option>
                    <option>medium</option>
                    <option>high</option>
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
                <img :src="'data:image/png;base64,' + ai_response_image" alt="Generated Image" />
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