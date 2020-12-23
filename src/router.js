import Vue from "vue";
import Router from "vue-router";
import LandingPage from "./views/LandingPage.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "welcome",
      component: LandingPage,
      meta: {
        title: 'Let\'s start - KidBright',
        metaTags: [
          {
            name: 'description',
            content: 'Let\'s start with KidBright.'
          },
          {
            property: 'og:description',
            content: 'Let\'s start with KidBright.'
          }
        ]
      }
    },
    {
      path: "/home",
      name: "home",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/Home.vue"),
        meta: {
          title: 'Main - KidBright',
          metaTags: [
            {
              name: 'description',
              content: 'KidBright AI Toolkit.'
            },
            {
              property: 'og:description',
              content: 'KidBright AI Toolkit.'
            }
          ]
        }
    },
  ],
});
