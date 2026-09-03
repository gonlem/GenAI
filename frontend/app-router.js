import * as VueRouter from 'vue-router';
import Gpt from './pages/gpt.vue';
import GptImage from './pages/gpt-image.vue';
import Gemini from './pages/gemini.vue';
import GeminiImage from './pages/gemini-image.vue';
import Muse from './pages/muse.vue';

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        { path: '/', component: Gpt },
        { path: '/gpt', component: Gpt},
        { path: '/gpt-image', component: GptImage },
        { path: '/gemini', component: Gemini },
        { path: '/gemini-image', component: GeminiImage },
        { path: '/muse', component: Muse }
    ]
})

export default router;