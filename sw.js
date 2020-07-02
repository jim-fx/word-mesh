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
    "revision": "b3c7f0031c621fcb6b70642523b3f11c"
  },
  {
    "url": "src.530aeb8c.js",
    "revision": "09c731cf756bfba4346dadbd011c75b1"
  },
  {
    "url": "src.878db36f.css",
    "revision": "9860ba7cd183d90cc9d310ab65ea8227"
  },
  {
    "url": "src.f004ecfd.css",
    "revision": "9eea00d6db393d3fca56fcd5bcd0c520"
  },
  {
    "url": "/",
    "revision": "b49c4f08aa874bd48fa51e67b78d2979"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL("/index.html"));
