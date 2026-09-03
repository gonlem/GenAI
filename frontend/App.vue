<script setup>
import * as Vue from 'vue';

</script>

<template>
    <header>
        <div class="header-left">
            <h1 id="title">Generative AI Tools</h1>
        </div>
        <nav class="header-right">
            <router-link to="/gpt">GPT API</router-link>
            <router-link to="/gpt-image">GPT Image API</router-link>
            <router-link to="/gemini">Gemini API</router-link>
            <router-link to="/gemini-image">Gemini Image API</router-link>
            <router-link to="/muse">Muse API</router-link>
        </nav>
    </header>
    <main>
        <router-view />
    </main>
</template>

<style>
@import "./assets/base.css";

#app {
    min-height: 100vh;
    min-width: fit-content;
    display: grid;
    grid-template-rows: auto 1fr;
}

#app > header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    background: linear-gradient(to right, hsl(var(--primary-color-h), var(--primary-color-s), 30%), hsl(var(--primary-color-h), var(--primary-color-s), 50%));
    color: white;
    padding: 8px 16px;
}

#app > header #title {
    font-family: sans-serif;
    font-size: 2rem;
    font-weight: normal;
}

#app > header nav {
    display: flex;
}

#app > header nav > a {
    color: white;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 8px;
}

#app > header nav > a:hover {
    background-color: hsl(var(--primary-color-h), var(--primary-color-s), 40%);
    color: white;
}

#app > header nav > a.router-link-active {
    text-decoration: underline;
}

#app > main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    gap: 16px;
    background-color: aliceblue;
}
</style>