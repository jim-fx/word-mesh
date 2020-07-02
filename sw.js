/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

workbox.core.skipWaiting();

workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "index.html",
    "revision": "6660c41f138874ea6fa255a636e85b55"
  },
  {
    "url": "src.878db36f.css",
    "revision": "9860ba7cd183d90cc9d310ab65ea8227"
  },
  {
    "url": "src.af0f731f.js",
    "revision": "4309a8b33b49e63aa39815ed98ed0cc0"
  },
  {
    "url": "src.f004ecfd.css",
    "revision": "9eea00d6db393d3fca56fcd5bcd0c520"
  },
  {
    "url": "/",
    "revision": "e768d1cf05e68e5126c3700cecea9e48"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL("/index.html"));
