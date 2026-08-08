<script setup>
import * as Vue from 'vue';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true
});

const ai_request = Vue.ref('');
const ai_response = Vue.ref('');
const ai_reasoning = Vue.ref('');
const ai_model = Vue.ref('gpt-5.6-luna');
const ai_reasoning_effort = Vue.ref('medium');
const ai_reasoning_mode = Vue.ref('standard');
const ai_reasoning_summary = Vue.ref('auto');
const ai_service_tier = Vue.ref('flex');
const ai_text_verbosity = Vue.ref('medium');
const ai_temperature = Vue.ref(1.0);
const ai_web_search = Vue.ref('no');
const ai_store = Vue.ref('yes');

async function callApi() {
    try {
        ai_response.value = 'Loading...';
        let startTime = Date.now();
        const response = await openai.responses.create({
            model: ai_model.value,
            reasoning: { effort: ai_reasoning_effort.value, mode: ai_reasoning_mode.value, summary: ai_reasoning_summary.value },
            input: ai_request.value,
            service_tier: ai_service_tier.value,
            text: { verbosity: ai_text_verbosity.value },
            store: ai_store.value === 'yes',
            temperature: parseFloat(ai_temperature.value),
            tools: ai_web_search.value === 'yes' ? [{ type: 'web_search' }] : [],
        });
        let endTime = Date.now();
        let responseText = `[Response time: ${(endTime - startTime) / 1000} seconds]\n`;
        responseText += `[Model: ${response.model}]\n`;
        responseText += `[Reasoning effort: ${response.reasoning?.effort}]\n`;
        responseText += `[Reasoning mode: ${response.reasoning?.mode}]\n`;
        responseText += `[Reasoning summary: ${response.reasoning?.summary}]\n`;
        responseText += `[Temperature: ${response.temperature}]\n`;
        responseText += `[Service tier: ${response.service_tier}]\n`;
        responseText += `[Text verbosity: ${response.text.verbosity}]\n`;
        responseText += `[Input tokens: ${response.usage.input_tokens}]\n`;
        responseText += `[Reasoning tokens: ${response.usage.output_tokens_details.reasoning_tokens}]\n`;
        responseText += `[Output tokens: ${(response.usage.output_tokens - response.usage.output_tokens_details.reasoning_tokens)}]\n`;
        responseText += `[Total tokens: ${response.usage.total_tokens}]\n`;
        const cost = getEstimatedCost(response.usage.input_tokens, response.usage.output_tokens);
        responseText += `[Estimated cost: €${cost.toFixed(6)}]\n\n`;
        responseText += response.output_text;
        ai_response.value = responseText;
        ai_reasoning.value = response.output.find((item) => item.type === 'reasoning')?.summary[0]?.text || '';
    } catch (error) {
        ai_response.value = `Error: ${error.message}`;
    }
}

function getEstimatedCost(inputTokens, outputTokens) {
    let cost = 0.0;
    switch (ai_model.value) {
        case 'gpt-5.6-sol':
            cost = (5.00 * inputTokens + 30.00 * outputTokens) / 1000000;
            break;
        case 'gpt-5.6-terra':
            cost = (2.00 * inputTokens + 12.00 * outputTokens) / 1000000;
            break;
        case 'gpt-5.6-luna':
            cost = (0.20 * inputTokens + 1.20 * outputTokens) / 1000000;
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
            <label>
                <span>Reasoning</span>
                <textarea name="reasoning" v-model="ai_reasoning"></textarea>
            </label>
        </div>
        <div class="flex-column fit-content">
            <label>
                <span>Model</span>
                <select name="model" v-model="ai_model" required>
                    <option>gpt-5.6-sol</option>
                    <option>gpt-5.6-terra</option>
                    <option>gpt-5.6-luna</option>
                </select>
            </label>
            <label>
                <span>Effort</span>
                <select name="reasoning_effort" v-model="ai_reasoning_effort" required>
                    <option>none</option>
                    <option>low</option>
                    <option>medium</option>
                    <option>high</option>
                    <option>xhigh</option>
                    <option>max</option>
                </select>
            </label>
            <label>
                <span>Mode</span>
                <select name="reasoning_mode" v-model="ai_reasoning_mode" required>
                    <option>standard</option>
                    <option>pro</option>
                </select>
            </label>
            <label>
                <span>Summary</span>
                <select name="reasoning_summary" v-model="ai_reasoning_summary" required>
                    <option>auto</option>
                    <option>concise</option>
                    <option>detailed</option>
                </select>
            </label>
            <label>
                <span>Service Tier</span>
                <select name="service_tier" v-model="ai_service_tier" required>
                    <option>auto</option>
                    <option>flex</option>
                    <option>default</option>
                    <option>fast</option>
                </select>
            </label>
            <label>
                <span>Text verbosity</span>
                <select name="text_verbosity" v-model="ai_text_verbosity" required>
                    <option>low</option>
                    <option>medium</option>
                    <option>high</option>
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
    min-height: 20rem;
    field-sizing: content;
}
</style>